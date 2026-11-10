interface MenuErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function MenuErrorState({
  message,
  onRetry,
}: MenuErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-red-800">
        We couldn’t load the menu
      </h3>

      <p className="mt-1 text-sm text-red-700">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  );
}