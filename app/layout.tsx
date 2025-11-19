import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "재무재표 분석 시스템",
  description: "오픈다트 API를 활용한 재무재표 분석 및 시각화",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

