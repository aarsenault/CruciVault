import * as React from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: {
    title: string;
    description?: string;
    status: "pending" | "current" | "completed" | "error";
  }[];
  className?: string;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center space-x-3", className)}
        {...props}
      >
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn("h-2 w-2 rounded-full transition-colors", {
              "bg-gray-600": step.status === "pending",
              "bg-yellow-400": step.status === "current",
              "bg-green-600": step.status === "completed",
              "bg-red-500": step.status === "error",
            })}
          />
        ))}
      </div>
    );
  }
);

Stepper.displayName = "Stepper";

export { Stepper };
