"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back! 👋");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <InteractiveBackground />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 32 }}>
            <div className="nav-logo-icon" style={{ width: 36, height: 36 }}><Zap size={17} color="white" /></div>
            <span style={{ fontWeight: 800, fontSize: 18 }}>
              CareerShift{" "}
              <span style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
            </span>
          </Link>

          <h1 style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.03em", marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>

        {/* Card */}
        <div style={{
          padding: "32px",
          background: "rgba(13,13,31,0.78)",
          border: "1px solid rgba(139,92,246,0.18)",
          borderRadius: 20,
          backdropFilter: "blur(20px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                {...register("email")}
                id="login-email"
                type="email"
                className="input"
                placeholder="alex@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="input-error">{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="input-label">Password</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "#a78bfa", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  {...register("password")}
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  className="input"
                  placeholder="Your password"
                  style={{ paddingRight: 48 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="input-error">{errors.password.message}</span>}
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-full"
              id="login-submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: 6, padding: "14px", fontSize: 15 }}
            >
              {loading ? (
                <><span className="spinner" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Test: <span style={{ color: "var(--text-secondary)" }}>sarah@example.com / Password123!</span>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
          {["Secure JWT auth", "No spam", "Free forever"].map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
              <CheckCircle2 size={12} color="#10b981" /> {t}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
