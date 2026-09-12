import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "여행 준비물 체크리스트",
  description: "여행 준비물과 일정을 관리하는 체크리스트 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas text-ink">{children}</body>
    </html>
  );
}
