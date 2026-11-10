import FoodItem from "../models/FoodItem.model.js";
import { IFoodItem } from "../types/index.js";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const FOOD_MENU_SORT_MAP = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
} as const;

type FoodMenuSort = keyof typeof FOOD_MENU_SORT_MAP;

export const foodService = {
  async getAllAvailable(options: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
    sort?: FoodMenuSort;
  }) {
    const {
      page,
      limit,
      category,
      search,
      sort = "newest",
    } = options;

    const filter: Record<string, unknown> = {
      isAvailable: true,
    };

    if (category) {
      filter.category = {
        $regex: `^${escapeRegex(category)}$`,
        $options: "i",
      };
    }

    if (search) {
      filter.name = {
        $regex: escapeRegex(search),
        $options: "i",
      };
    }

    const selectedSort =
      FOOD_MENU_SORT_MAP[sort] ?? FOOD_MENU_SORT_MAP.newest;

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      FoodItem.find(filter)
        .sort(selectedSort)
        .skip(skip)
        .limit(limit),

      FoodItem.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },

  async getAvailableCategories() {
    const categories = await FoodItem.distinct("category", {
      isAvailable: true,
    });

    return categories
      .filter(
        (category): category is string =>
          typeof category === "string",
      )
      .map((category) => category.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  },

  async getAllForAdmin() {
    return FoodItem.find().sort({ createdAt: -1 });
  },

  async create(
    data: Omit<
      IFoodItem,
      "_id" | "createdAt" | "updatedAt"
    >,
  ) {
    return FoodItem.create(data);
  },

  async updateById(id: string, data: Partial<IFoodItem>) {
    const updated = await FoodItem.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      const error = new Error("Food item not found") as Error & {
        status?: number;
      };

      error.status = 404;
      throw error;
    }

    return updated;
  },

  async softDeleteById(id: string) {
    const item = await FoodItem.findByIdAndUpdate(
      id,
      { isAvailable: false },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!item) {
      const error = new Error("Food item not found") as Error & {
        status?: number;
      };

      error.status = 404;
      throw error;
    }

    return item;
  },

  async restoreById(id: string) {
    const item = await FoodItem.findByIdAndUpdate(
      id,
      { isAvailable: true },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!item) {
      const error = new Error("Food item not found") as Error & {
        status?: number;
      };

      error.status = 404;
      throw error;
    }

    return item;
  },
};