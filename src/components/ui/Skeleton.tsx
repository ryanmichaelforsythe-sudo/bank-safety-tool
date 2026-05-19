/**
 * Skeleton — animated placeholder for loading states.
 * aria-hidden="true" — decorative, screen readers skip it.
 */

interface SkeletonProps {
  className?: string;
  /** Height in Tailwind units (e.g., "h-4", "h-20") */
  height?: string;
  /** Width in Tailwind units (e.g., "w-full", "w-32") */
  width?: string;
}

export function Skeleton({
  className = "",
  height = "h-4",
  width = "w-full",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-gray-200 ${height} ${width} ${className}`}
    />
  );
}

/**
 * SkeletonCard — full card-sized skeleton for indicator card loading states.
 */
export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >
      <Skeleton height="h-5" width="w-2/3" className="mb-2" />
      <Skeleton height="h-3" width="w-1/3" className="mb-4" />
      <Skeleton height="h-8" width="w-1/4" className="mb-4" />
      <Skeleton height="h-24" width="w-full" className="mb-3" />
      <Skeleton height="h-3" width="w-full" className="mb-1" />
      <Skeleton height="h-3" width="w-4/5" />
    </div>
  );
}
