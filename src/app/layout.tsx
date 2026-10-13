import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/noto-serif-kr/400.css";
import "@fontsource/noto-serif-sc/400.css";
import "./globals.css";
import "./refinement.css";
export const metadata: Metadata = {
  title: {
    default: "Maison — Exceptional Homes, Considered Living",
    template: "%s | Maison",
  },
  description:
    "A considered collection of extraordinary rental homes in Vietnam. A fully interactive, multilingual frontend demonstration.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body id="top">{children}</body>
    </html>
  );
}
