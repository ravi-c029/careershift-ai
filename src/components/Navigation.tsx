"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  LayoutDashboard,
  Brain,
  Map,
  Users,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze Career", icon: Brain },
  { href: "/roadmap", label: "My Roadmap", icon: Map },
  { href: "/community", label: "Community", icon: Users },
  { href: "/jobs", label: "AI-Safe Jobs", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="navbar">
        <div className="container flex-between w-full">
          <Link href={user ? "/dashboard" : "/"} className="nav-logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="nav-logo-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ display: "flex", alignItems: "center", lineHeight: 1, paddingTop: "2px" }}>
              CareerShift&nbsp;<span className="gradient-text">AI</span>
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                className="md:hidden btn btn-ghost"
                style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="hidden md:flex items-center gap-2">
                <div className="avatar avatar-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    user.name?.[0]?.toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {user.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && user && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--bg-secondary)",
            zIndex: 99,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-item ${pathname === href ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
          <button
            className="sidebar-item"
            onClick={() => { logout(); setMobileOpen(false); }}
            style={{ marginTop: "auto", color: "var(--accent-red)" }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`sidebar-item ${pathname === href ? "active" : ""}`}
        >
          <Icon size={20} className="sidebar-icon" />
          {label}
        </Link>
      ))}
      <div style={{ flex: 1 }} />
      <button
        className="sidebar-item"
        onClick={logout}
        style={{ color: "var(--accent-red)" }}
      >
        <LogOut size={20} className="sidebar-icon" />
        Logout
      </button>
    </aside>
  );
}
