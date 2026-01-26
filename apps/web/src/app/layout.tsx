import type { Metadata } from "next";

import { ErrorBoundary } from "@/shared/ui";
import { TRPCProvider } from "@/trpc";

import "./globals.css";

export const metadata: Metadata = {
  title: "Way Finderz",
  description: "A language learning flashcard game",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </TRPCProvider>
      </body>
    </html>
  );
}
