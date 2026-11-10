import type { Metadata } from "next";
import "./globals.css";
import "../styles/immersive.css";

export const metadata: Metadata = {
  title: "Poverty Die | Wealth Collective",
  description: "A private, transparent investment group for friends.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
