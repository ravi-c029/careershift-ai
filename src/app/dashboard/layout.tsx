"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar, Sidebar } from "@/components/Navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">{children}</main>
      </div>
    </>
  );
}
