import mongoose, { Document, Model, Schema } from 'mongoose';
import { IFoodItem } from '../types/index.js';

export interface IFoodItemDoc extends Document, Omit<IFoodItem, '_id'> {}

const foodItemSchema = new Schema<IFoodItemDoc>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FoodItem: Model<IFoodItemDoc> =
  mongoose.models.FoodItem ||
  mongoose.model<IFoodItemDoc>('FoodItem', foodItemSchema);

export default FoodItem;