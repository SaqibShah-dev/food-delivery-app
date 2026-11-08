import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { foodService } from "../services/food.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { IFoodItem } from "../types/index.js";
import {
  deleteUploadedImage,
  uploadImage,
} from "../config/cloudinary.js";

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pageValue = Number(req.query.page);
  const limitValue = Number(req.query.limit);

  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

  const limit =
    Number.isInteger(limitValue) && limitValue > 0
      ? Math.min(limitValue, 50)
      : 10;

  const category =
    typeof req.query.category === "string"
      ? req.query.category.trim()
      : undefined;

  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  const result = await foodService.getAllAvailable({
    page,
    limit,
    category: category || undefined,
    search: search || undefined,
  });

  res.json(apiResponse(result, "Available food items"));
});
export const getCategories = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const categories = await foodService.getAvailableCategories();

    res.json(apiResponse(categories, "Available food categories"));
  },
);

export const getAllForAdmin = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const items = await foodService.getAllForAdmin();

    res.json(apiResponse(items, "All food items for admin"));
  },
);

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, price, category } = req.body as {
    name: string;
    description: string;
    price: number;
    category: string;
  };

  const uploadedImage = await uploadImage(req.file!.buffer);

  let item;
  try {
    item = await foodService.create({
      name,
      description,
      price,
      category,
      image: uploadedImage.secure_url,
      isAvailable: true,
    });
  } catch (error) {
    await deleteUploadedImage(uploadedImage.public_id);
    throw error;
  }

  res.status(201).json(apiResponse(item, "Food item created", 201));
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    const err: any = new Error("A valid food item ID is required");
    err.status = 400;
    throw err;
  }

  const updateData = req.body as Partial<IFoodItem>;

  const uploadedImage = req.file
    ? await uploadImage(req.file.buffer)
    : undefined;

  if (uploadedImage) {
    updateData.image = uploadedImage.secure_url;
  }

  let item;
  try {
    item = await foodService.updateById(id, updateData);
  } catch (error) {
    if (uploadedImage) {
      await deleteUploadedImage(uploadedImage.public_id);
    }

    throw error;
  }

  res.json(apiResponse(item, "Food item updated"));
});

export const softDelete = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      const err: any = new Error("A valid food item ID is required");
      err.status = 400;
      throw err;
    }

    const item = await foodService.softDeleteById(id);

    res.json(apiResponse(item, "Food item hidden from customers"));
  },
);

export const restore = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    const err: any = new Error("A valid food item ID is required");
    err.status = 400;
    throw err;
  }

  const item = await foodService.restoreById(id);

  res.json(apiResponse(item, "Food item restored and available"));
});
