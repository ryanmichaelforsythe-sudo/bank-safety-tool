/**
 * ErrorMessage — domain-agnostic error display primitive.
 * Uses role="alert" and aria-live="assertive" for immediate screen reader announcement.
 */

import { RetryButton } from "./RetryButton";

type ErrorType = "timeout" | "api" | "partial" | "general";

interface ErrorMessageProps {
  type?: ErrorType;
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ERROR_ICONS: Record<ErrorType, string> = {
  timeout: "⏱",
  api: "⚠️",
  partial: "⚡",
  general: "❌",
};

export function ErrorMessage({
  type = "general",
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 ${className}`}
    >
      <span className="text-lg" aria-hidden="true">
        {ERROR_ICONS[type]}
      </span>
      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
        {onRetry && <RetryButton onClick={onRetry} className="mt-2" />}
      </div>
    </div>
  );
}
