"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-semibold text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border border-gray-300 px-4 py-2 text-base transition-colors",
            "placeholder:text-gray-400",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:bg-gray-100",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
