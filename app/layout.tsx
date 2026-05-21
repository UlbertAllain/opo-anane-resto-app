// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins", // Mendaftarkan CSS variable
});

export const metadata: Metadata = {
  title: "Opo Ana Ne - Warm Local Culinary",
  description: "Aplikasi restoran lokal Jawa yang modern, nyaman, dan bikin lapar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Tambahkan variabel font ke body, dan arahkan font-sans ke variabel tsb */}
      <body className={`${poppins.variable} font-sans bg-warm-cream text-text-primary`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}