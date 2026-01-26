import { cn } from "@/shared/lib";

export interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  return (
    <div
      className={cn(
        "p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
