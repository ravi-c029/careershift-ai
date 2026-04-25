"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match" });

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ password, confirm });
    if (!result.success) return toast.error(result.error.issues[0].message);
    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Reset failed";
      toast.error(msg);
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
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>Set new password</h1>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ marginBottom: 12 }}>Password reset!</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" style={{ paddingRight: 44 }} id="reset-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" id="reset-confirm" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="reset-submit">
                {loading ? <><span className="spinner" /> Resetting...</> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetForm /></Suspense>;
}
