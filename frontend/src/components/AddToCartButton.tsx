import { useState } from "react";

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
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(food);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        added
          ? "bg-emerald-600 text-white"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      } ${className}`}
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
