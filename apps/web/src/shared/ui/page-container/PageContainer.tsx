import { cn } from "@/shared/lib";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function PageContainer({
  children,
  className,
  maxWidth = "md",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "min-h-[80vh] flex items-center justify-center px-4",
        className
      )}
    >
      <div className={cn("w-full", maxWidthClasses[maxWidth])}>{children}</div>
    </div>
  );
}
