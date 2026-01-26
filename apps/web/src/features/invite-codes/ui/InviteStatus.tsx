import { cn } from "@/shared/lib";

export interface InviteStatusProps {
  isValid: boolean;
  className?: string;
}

export function InviteStatus({ isValid, className }: InviteStatusProps) {
  return (
    <span
      className={cn(
        "inline-flex px-3 py-1 rounded-lg text-sm font-medium",
        isValid
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700",
        className
      )}
    >
      {isValid ? "Valid" : "Invalid"}
    </span>
  );
}
