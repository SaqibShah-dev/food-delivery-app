import { Types } from "mongoose";
import FoodItem from "../models/FoodItem.model.js";
import Order from "../models/Order.model.js";
import { IAddress, IOrderItem } from "../types/index.js";
import type { PaymentMethod } from "../types/index.js";

type RequestedOrderItem = {
  foodId: string;
  quantity: number;
};

export const orderService = {
  async createOrder(
    userId: string,
    requestedItems: RequestedOrderItem[],
    address: IAddress,
    paymentMethod: PaymentMethod = "stripe",
  ) {
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      const err: any = new Error("Your cart must contain at least one item");
      err.status = 400;
      throw err;
    }

    const foodIds = requestedItems.map((item) => item.foodId);

    if (
      foodIds.some(
        (foodId) =>
          typeof foodId !== "string" || !Types.ObjectId.isValid(foodId),
      )
    ) {
      const err: any = new Error("Every foodId must be a valid food item ID");
      err.status = 400;
      throw err;
    }

    const foodItems = await FoodItem.find({
      _id: { $in: foodIds },
      isAvailable: true,
    });

    if (foodItems.length !== foodIds.length) {
      const err: any = new Error(
        "One or more food items do not exist or are unavailable",
      );
      err.status = 400;
      throw err;
    }

    const foodById = new Map(
      foodItems.map((food) => [food._id.toString(), food]),
    );

    const items: IOrderItem[] = requestedItems.map((requestedItem) => {
      const quantity = Number(requestedItem.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        const err: any = new Error(
          "Every item quantity must be a whole number greater than 0",
        );
        err.status = 400;
        throw err;
      }

      const food = foodById.get(requestedItem.foodId);

      if (!food) {
        const err: any = new Error("Food item was not found");
        err.status = 400;
        throw err;
      }

      const unitPrice = Math.round(food.price * 100) / 100;
      const subtotal = (Math.round(unitPrice * 100) * quantity) / 100;

      return {
        food: food._id.toString(),
        quantity,
        foodName: food.name,
        foodImage: food.image,
        foodCategory: food.category,
        unitPrice,
        subtotal,
      };
    });

    const totalAmount =
      items.reduce((sum, item) => sum + Math.round(item.subtotal * 100), 0) /
      100;

    return Order.create({
      user: userId,
      items,
      totalAmount,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
      address,
    });
  },

  async getOrdersForUser(userId: string) {
    return Order.find({ user: userId })
      .populate("items.food", "name image category")
      .sort({ createdAt: -1 });
  },

  async getAllOrders(options: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query: any = { isDeleted: { $ne: true } };

    if (options.status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "out-for-delivery",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(options.status)) {
        const err: any = new Error(
          `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        );
        err.status = 400;
        throw err;
      }

      query.status = options.status;
    }

    if (options.startDate || options.endDate) {
      query.createdAt = {};

      if (options.startDate) {
        const start = new Date(options.startDate);
        if (isNaN(start.getTime())) {
          const err: any = new Error("Invalid startDate format");
          err.status = 400;
          throw err;
        }
        query.createdAt.$gte = start;
      }

      if (options.endDate) {
        const end = new Date(options.endDate);
        if (isNaN(end.getTime())) {
          const err: any = new Error("Invalid endDate format");
          err.status = 400;
          throw err;
        }
        // Include the entire end date (set to end of day)
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    return Order.find(query)
      .populate("user", "name email")
      .populate("items.food", "name image category")
      .sort({ createdAt: -1 });
  },

  async getById(id: string) {
    return Order.findById(id)
      .populate("user", "name email")
      .populate("items.food", "name image category");
  },

  async updateOrderStatus(id: string, status: string) {
    const transitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["out-for-delivery", "cancelled"],
      "out-for-delivery": ["delivered"],
      delivered: [],
      cancelled: [],
    };

    if (!Object.hasOwn(transitions, status)) {
      const err: any = new Error("Invalid order status");
      err.status = 400;
      throw err;
    }

    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      const err: any = new Error("Order not found");
      err.status = 404;
      throw err;
    }

    if (currentOrder.status === status) {
      return currentOrder.populate([
        { path: "user", select: "name email" },
        { path: "items.food", select: "name image category" },
      ]);
    }

    if (!transitions[currentOrder.status]?.includes(status)) {
      const err: any = new Error(
        `Order cannot transition from "${currentOrder.status}" to "${status}"`,
      );
      err.status = 409;
      throw err;
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, status: currentOrder.status },
      { status },
      { new: true, runValidators: true },
    )
      .populate("user", "name email")
      .populate("items.food", "name image category");

    if (!order) {
      const err: any = new Error(
        "Order status changed concurrently; refresh and try again",
      );
      err.status = 409;
      throw err;
    }

    return order;
  },
  async findByPaymentMetadata(
    userId: string,
    totalAmount: number,
    foodIds: string[],
  ) {
    const orders = await Order.find({
      user: userId,
      totalAmount,
      paymentStatus: "pending",
      "items.food": { $in: foodIds },
    })
      .sort({ createdAt: -1 })
      .limit(1);

    return orders[0] || null;
  },

  async markOrderAsPaid(
    orderId: string,
    userId: string,
    paymentId: string,
    amountTotal: number | null,
    currency: string | null,
  ) {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      const err: any = new Error("Order not found");
      err.status = 404;
      throw err;
    }

    if (order.paymentMethod !== "stripe") {
      const err: any = new Error(
        "Stripe payment cannot be applied to a cash on delivery order",
      );
      err.status = 409;
      throw err;
    }

    if (
      order.checkoutSessionId &&
      order.checkoutSessionId !== paymentId
    ) {
      const err: any = new Error(
        "Stripe Checkout Session does not match the session created for this order",
      );
      err.status = 409;
      throw err;
    }

    if (
      currency?.toLowerCase() !== "usd" ||
      amountTotal !== Math.round(order.totalAmount * 100)
    ) {
      const err: any = new Error(
        "Stripe payment amount does not match the order total",
      );
      err.status = 400;
      throw err;
    }

    if (order.paymentStatus === "paid" && order.paymentId === paymentId) {
      return order;
    }

    if (order.paymentStatus === "paid") {
      const err: any = new Error(
        "Order was already paid by a different Stripe Checkout Session",
      );
      err.status = 409;
      throw err;
    }

    if (order.status === "cancelled") {
      const err: any = new Error("Cancelled orders cannot be paid");
      err.status = 409;
      throw err;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        user: userId,
        paymentStatus: { $ne: "paid" },
        status: { $ne: "cancelled" },
      },
      { paymentStatus: "paid", paymentId },
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      const latestOrder = await Order.findOne({ _id: orderId, user: userId });
      if (
        latestOrder?.paymentStatus === "paid" &&
        latestOrder.paymentId === paymentId
      ) {
        return latestOrder;
      }

      const err: any = new Error("Order payment status changed unexpectedly");
      err.status = 409;
      throw err;
    }

    return updatedOrder;
  },
  async markCashOnDeliveryAsPaid(orderId: string) {
    const order = await Order.findById(orderId);

    if (!order) {
      const err: any = new Error("Order not found");
      err.status = 404;
      throw err;
    }

    if (order.paymentMethod !== "cod") {
      const err: any = new Error(
        "Only cash on delivery orders can be marked as cash collected",
      );
      err.status = 409;
      throw err;
    }

    if (order.status === "cancelled") {
      const err: any = new Error(
        "Cancelled orders cannot be marked as paid",
      );
      err.status = 409;
      throw err;
    }

    if (order.paymentStatus === "paid") {
      return Order.findById(orderId)
        .populate("user", "name email")
        .populate("items.food", "name image category");
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        paymentMethod: "cod",
        paymentStatus: { $ne: "paid" },
        status: { $ne: "cancelled" },
      },
      { paymentStatus: "paid" },
      { new: true, runValidators: true },
    )
      .populate("user", "name email")
      .populate("items.food", "name image category");

    if (!updatedOrder) {
      const err: any = new Error("Order payment status changed unexpectedly");
      err.status = 409;
      throw err;
    }

    return updatedOrder;
  },
  async getDashboardStats() {
    const totalOrdersResult = await Order.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $count: "total" },
    ]);

    const totalOrders = totalOrdersResult[0]?.total || 0;

    const revenueResult = await Order.aggregate([
      { $match: { isDeleted: { $ne: true }, paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const pendingOrdersResult = await Order.aggregate([
      { $match: { isDeleted: { $ne: true }, status: "pending" } },
      { $count: "total" },
    ]);

    const pendingOrders = pendingOrdersResult[0]?.total || 0;

    const recentOrders = await Order.find({
      isDeleted: { $ne: true },
    })
      .populate("user", "name email")
      .populate("items.food", "name image")
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingOrders,
      recentOrders,
    };
  },
  async getPopularFoodItems(limit: number = 10) {
    const results = await Order.aggregate([
      { $match: { isDeleted: { $ne: true }, paymentStatus: "paid" } },

      // Deconstruct items array into separate documents
      { $unwind: "$items" },

      // Group by food item
      {
        $group: {
          _id: "$items.food",
          name: { $first: "$items.foodName" },
          image: { $first: "$items.foodImage" },
          category: { $first: "$items.foodCategory" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
          orderCount: { $sum: 1 },
        },
      },

      // Sort by total quantity sold, descending
      { $sort: { totalQuantity: -1 } },

      // Limit results
      { $limit: limit },

      // Join with FoodItem collection to get name/image
      {
        $lookup: {
          from: "fooditems",
          localField: "_id",
          foreignField: "_id",
          as: "food",
        },
      },

      // Shape the output
      {
        $project: {
          _id: 0,
          foodId: "$_id",
          name: { $ifNull: ["$name", { $arrayElemAt: ["$food.name", 0] }] },
          image: { $ifNull: ["$image", { $arrayElemAt: ["$food.image", 0] }] },
          category: {
            $ifNull: ["$category", { $arrayElemAt: ["$food.category", 0] }],
          },
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    return results.map((item) => ({
      ...item,
      totalRevenue: Number(item.totalRevenue.toFixed(2)),
    }));
  },
  async getRevenueByCategory() {
  const results = await Order.aggregate([
    { $match: { isDeleted: { $ne: true }, paymentStatus: "paid" } },

    // Deconstruct items array
    { $unwind: '$items' },

    // Join with FoodItem to get category
    {
      $lookup: {
        from: 'fooditems',
        localField: 'items.food',
        foreignField: '_id',
        as: 'foodDetails',
      },
    },

    {
      $addFields: {
        category: {
          $ifNull: [
            '$items.foodCategory',
            { $arrayElemAt: ['$foodDetails.category', 0] },
          ],
        },
      },
    },
    { $match: { category: { $ne: null } } },

    // Group by category
    {
      $group: {
        _id: '$category',
        totalRevenue: { $sum: '$items.subtotal' },
        totalQuantity: { $sum: '$items.quantity' },
        orderCount: { $sum: 1 },
      },
    },

    // Sort by revenue, descending
    { $sort: { totalRevenue: -1 } },

    // Shape output
    {
      $project: {
        _id: 0,
        category: '$_id',
        totalRevenue: 1,
        totalQuantity: 1,
        orderCount: 1,
      },
    },
  ]);

  return results.map((item) => ({
    ...item,
    totalRevenue: Number(item.totalRevenue.toFixed(2)),
  }));
},
};
