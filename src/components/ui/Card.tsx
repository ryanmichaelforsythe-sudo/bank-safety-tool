/**
 * Card — domain-agnostic container primitive.
 * Provides border, padding, and optional header slot.
 * Uses <article> for semantic structure with aria-label passthrough.
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function Card({ children, className = "", "aria-label": ariaLabel }: CardProps) {
  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </article>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <header className={`mb-3 ${className}`}>{children}</header>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`${className}`}>{children}</div>;
}
