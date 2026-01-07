import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ text = "加载中", className, size = "md" }: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-muted-foreground mb-3")} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
