import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "星序 · 项目看板",
  description: "项目、任务和子任务的私人进度工作台",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
