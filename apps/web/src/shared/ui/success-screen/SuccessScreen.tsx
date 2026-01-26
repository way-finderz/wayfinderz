import { cn } from "@/shared/lib";

export interface SuccessScreenProps {
  emoji?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function SuccessScreen({
  emoji = "🎉",
  title,
  description,
  children,
  className,
}: SuccessScreenProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-6xl mb-6">{emoji}</div>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
      {children}
    </div>
  );
}
