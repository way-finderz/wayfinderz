"use client";

import { cn } from "@/shared/lib";

interface FooterProps {
  className?: string;
  version?: string;
}

export function Footer({ className, version = "0.1.0" }: FooterProps) {
  return (
    <footer className={cn("w-full py-4", className)}>
      <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <a
            href="/terms"
            target="_blank"
            rel="noopener"
            className="hover:text-gray-700 transition-colors"
          >
            Terms of Use
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener"
            className="hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </a>
        </div>
        <p className="text-xs text-gray-400">v{version}</p>
      </div>
    </footer>
  );
}
