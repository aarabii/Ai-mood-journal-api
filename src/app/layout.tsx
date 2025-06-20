import type { Metadata } from "next";
import "./globals.css";
import { geistMono, geistSans } from "./font";

export const metadata: Metadata = {
  title: "Ai Mood Journal",
  description:
    "A journal powered by AI to help you track your mood and emotions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
