import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/AuthProvider";
import { ToastProvider } from "@/components/Toast";
import ServiceWorkerRegistration from "@/components/ServiceWorker";
import OfflineBanner from "@/components/OfflineBanner";
import InstallPrompt from "@/components/InstallPrompt";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maktub - It Is Written",
  description:
    "A trust-based matrimony platform for Muslim families. Structured profiles, easy browsing, and meaningful connections.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Maktub",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2d6a4f",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-maktub-darker text-maktub-text pb-16 md:pb-0">
        <AuthProvider>
          <ToastProvider>
            <ServiceWorkerRegistration />
            <SplashScreen />
            <OfflineBanner />
            {children}
            <BottomNav />
            <InstallPrompt />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
