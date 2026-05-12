import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HopOn — operating system for equestrian barns",
  description:
    "HopOn is the operating system for high-performance equestrian businesses. Booking, payments, and barn coordination — built for trainers, grooms, riders, and owners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
