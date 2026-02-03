import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELDEPARFUM - Vitrine de Perfumes Premium",
  description: "Descubra fragrâncias luxuosas e exclusivas. Catálogo de perfumes premium para você.",
  keywords: "perfume, fragrância, premium, luxo, unissex, masculino, feminino",
  openGraph: {
    title: "ELDEPARFUM - Vitrine de Perfumes Premium",
    description: "Descubra fragrâncias luxuosas e exclusivas.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
