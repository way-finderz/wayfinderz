import { cn } from "@/shared/lib";

export interface WelcomeHeaderProps {
  userName?: string;
  subtitle?: string;
  className?: string;
}

export function WelcomeHeader({
  userName,
  subtitle = "Learn the language, find your way",
  className,
}: WelcomeHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 data-testid="welcome-heading" className="text-3xl font-bold mb-2">Welcome, {userName}!</h1>
      <p data-testid="welcome-subtitle" className="text-gray-600">{subtitle}</p>
    </div>
  );
}
