import { useState } from "react";
import { toast } from "sonner";

import { useCart } from "../hooks/useCart";

import type { IFoodItem } from "../types";

interface AddToCartButtonProps {
  food: IFoodItem;
  className?: string;
}

export default function AddToCartButton({
  food,
  className = "",
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const quantityInCart =
    items.find((item) => item.food._id === food._id)?.quantity ?? 0;
  const quantityLimitReached = quantityInCart >= 99;

  const handleClick = () => {
    if (quantityLimitReached) {
      return;
    }

    addItem(food);
    setAdded(true);
    toast.success(`${food.name} added to cart.`);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={quantityLimitReached}
      aria-label={
        quantityLimitReached
          ? `${food.name} quantity limit reached`
          : `Add ${food.name} to cart`
      }
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        added
          ? "bg-emerald-600 text-white"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      } disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {quantityLimitReached
        ? "Quantity limit reached"
        : added
          ? "Added to cart"
          : "Add to cart"}
    </button>
  );
}
