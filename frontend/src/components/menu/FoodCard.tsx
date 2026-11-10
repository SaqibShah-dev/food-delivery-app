import AddToCartButton from "../AddToCartButton";
import { Badge } from "../ui";
import { getFoodImageUrl } from "../../api/food";
import type { IFoodItem } from "../../types";
import { formatCurrency } from "../../utils/format";

const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#e2e8f0"/><text x="8" y="5" font-size="1.2" text-anchor="middle" fill="#64748b" font-family="sans-serif">No image</text></svg>`,
  );

export function FoodCard({ item }: { item: IFoodItem }) {
  const hasRating =
    typeof item.ratingAverage === "number" &&
    item.ratingAverage > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg">
      <div className="relative">
        <img
          src={getFoodImageUrl(item.image)}
          alt={item.name}
          loading="lazy"
          width={640}
          height={360}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = IMAGE_FALLBACK;
          }}
          className="aspect-video w-full bg-slate-100 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {item.category}
          </span>

          {item.isVegetarian && (
            <Badge tone="vegetarian">Vegetarian</Badge>
          )}

          {item.isSpicy && <Badge tone="spicy">Spicy</Badge>}
        </div>

        {item.isPopular && (
          <div className="absolute right-3 top-3">
            <Badge tone="popular">Popular</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug text-slate-900">
            {item.name}
          </h3>

          {hasRating && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>

              {item.ratingAverage?.toFixed(1)}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
          {item.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {typeof item.preparationMinutes === "number" && (
            <span>{item.preparationMinutes} min</span>
          )}

          {typeof item.calories === "number" && (
            <span>{item.calories} kcal</span>
          )}
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Price
            </p>

            <p className="text-xl font-bold text-indigo-600">
              {formatCurrency(item.price)}
            </p>
          </div>

          <AddToCartButton food={item} className="w-auto min-w-36" />
        </div>
      </div>
    </article>
  );
}