import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DAFA Glass - Quản lý Công việc & KPI",
  description: "Hệ thống quản lý công việc và đánh giá KPI nội bộ của DAFA Glass",
  icons: {
    icon: "/dafa-logo.png",
    apple: "/dafa-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DAFA",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
