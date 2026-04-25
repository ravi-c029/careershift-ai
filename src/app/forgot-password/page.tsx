"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24, textDecoration: "none" }}>
            <div className="nav-logo-icon"><Zap size={18} color="white" /></div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>CareerShift <span className="gradient-text">AI</span></span>
          </Link>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>Reset your password</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>We&apos;ll send a reset link to your email</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ marginBottom: 12 }}>Check your email</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <Link href="/login" className="btn btn-primary btn-full">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="forgot-email"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <><span className="spinner" /> Sending...</> : <><Send size={14} /> Send Reset Link</>}
              </button>
            </form>
          )}
        </div>

        <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, marginTop: 24, justifyContent: "center" }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
      </motion.div>
    </div>
  );
}
