import { FoodCard } from "./FoodCard";
import type { IFoodItem } from "../../types";

interface MenuGridProps {
  items: IFoodItem[];
  isRefreshing: boolean;
}

export function MenuGrid({ items, isRefreshing }: MenuGridProps) {
  return (
    <div
      aria-busy={isRefreshing}
      className={`grid gap-6 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
        isRefreshing
          ? "pointer-events-none opacity-60"
          : "opacity-100"
      }`}
    >
      {items.map((item) => (
        <FoodCard key={item._id} item={item} />
      ))}
    </div>
  );
}