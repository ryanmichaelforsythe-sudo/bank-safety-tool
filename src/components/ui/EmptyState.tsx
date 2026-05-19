/**
 * EmptyState — domain-agnostic missing-data display primitive.
 * Consumes EmptyStateReason and renders context-specific copy from the message map.
 * Uses role="status" so screen readers announce the reason.
 * Accepts optional children for card-specific context (e.g., Call Report link).
 */

import type { EmptyStateReason } from "@/types/domain";
import { EMPTY_STATE_MESSAGES } from "@/lib/content/emptyStateMessages";

interface EmptyStateProps {
  reason: EmptyStateReason;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ reason, className = "", children }: EmptyStateProps) {
  const { title, description } = EMPTY_STATE_MESSAGES[reason];

  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center rounded-md bg-gray-50 p-4 text-center ${className}`}
    >
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
