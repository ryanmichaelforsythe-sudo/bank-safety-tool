/**
 * Badge — domain-agnostic label primitive with color variants.
 * Uses <span role="status"> for screen reader announcements.
 */

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  "aria-label"?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
  "aria-label": ariaLabel,
}: BadgeProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
