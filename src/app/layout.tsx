import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JAL Prototype — Text to Video",
  description: "AI-powered text to video generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
