import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DogTektor - AI Dog Bark Detection",
  description: "AI/ML powered web application for real-time dog bark detection and analysis. Monitor barking patterns and identify different dogs.",
  keywords: ["dog", "bark", "detection", "audio", "ml", "ai", "web", "monitoring"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
