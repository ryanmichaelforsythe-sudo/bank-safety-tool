/**
 * RetryButton — accessible button for retrying failed operations.
 * Visible focus ring via global :focus-visible styles.
 */

interface RetryButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function RetryButton({
  onClick,
  label = "Try again",
  className = "",
}: RetryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Retry loading data"
      className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 ${className}`}
    >
      {label}
    </button>
  );
}
