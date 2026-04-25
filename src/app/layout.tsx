import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CareerShift AI — Navigate AI Disruption, Future-Proof Your Career",
  description:
    "CareerShift AI helps people whose careers are being disrupted by AI automation discover safe career paths, get personalized reskilling roadmaps, and connect with a community.",
  keywords: [
    "AI career transition",
    "career reskilling",
    "AI job displacement",
    "career change",
    "upskilling",
    "future of work",
  ],
  openGraph: {
    title: "CareerShift AI",
    description: "Navigate AI disruption. Future-proof your career.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1e1b4b",
                color: "#e2e8f0",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
