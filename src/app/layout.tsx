import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/immersive.css";

export const metadata: Metadata = {
  title: "Poverty Die | Wealth Collective",
  description: "A private, transparent investment group for friends.",
  applicationName: "Poverty Die",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "128x128" },
      { url: "/brand/poverty-die-mark.png", type: "image/png", sizes: "128x128" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "128x128", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#6D28D9",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
