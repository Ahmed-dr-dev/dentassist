import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import DateTimeBar from "@/components/DateTimeBar";
import PatientChatbot from "@/components/PatientChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DentAssist - Gestion Intelligente de Cabinet Dentaire",
  description: "Plateforme Web Intelligente pour la gestion de cabinets dentaires avec IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <DateTimeBar />
          {children}
          <PatientChatbot />
        </Providers>
      </body>
    </html>
  );
}
