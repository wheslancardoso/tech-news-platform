import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { FloatingDevMenu } from "@/components/dev/FloatingDevMenu";
import { ChameleonProvider } from "@/components/chameleon-provider";
import { MobileNav } from "@/components/mobile-nav";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FRESH NEWS — Curadoria de Tech sem Hype",
  description: "Newsletter brutalista de tecnologia. Curadoria diária com IA para devs, hackers e entusiastas. Sem hype, sem clickbait — só o que importa.",
  keywords: ["tech news", "newsletter", "desenvolvimento", "segurança", "IA", "curadoria"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.has("admin_session");

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased noise-overlay`}
      >
        <ChameleonProvider>
          {children}
          <MobileNav />
        </ChameleonProvider>
        {isAdmin && <FloatingDevMenu />}
        <Toaster />
      </body>
    </html>
  );
}
