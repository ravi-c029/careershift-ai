"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2, Brain, Map, Users } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

const perks = [
  { icon: Brain, text: "Free AI career risk analysis" },
  { icon: Map, text: "Personalised 90-day roadmap" },
  { icon: Users, text: "50,000+ community members" },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      setDone(true);
      // AuthContext.signup() already pushes to /dashboard after a moment
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>
      <InteractiveBackground />

      {/* ── Left panel (hidden on mobile) ── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "none",
          position: "relative",
          zIndex: 1,
          // shown via media query below — we use inline style trick
        }}
        className="signup-left-panel"
      >
        {/* Gradient overlay on left */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(6,182,212,0.08) 100%)",
          borderRight: "1px solid rgba(139,92,246,0.2)",
          zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, padding: "60px 48px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div className="nav-logo-icon"><Zap size={20} color="white" /></div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>
              CareerShift <span style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
            </span>
          </Link>

          {/* Center content */}
          <div style={{ marginTop: 48 }}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 90, height: 90, borderRadius: 24,
                background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 32,
                boxShadow: "0 24px 60px rgba(139,92,246,0.4)",
              }}
            >
              <Zap size={40} color="white" />
            </motion.div>

            <h2 style={{ fontSize: "clamp(28px,3.5vw,42px)", lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.03em" }}>
              Future-proof
              <br />your career
              <br />
              <span style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                in 60 seconds.
              </span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.65, marginBottom: 40 }}>
              Join 50,000+ professionals using AI to navigate the biggest career disruption of our lifetime.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {perks.map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={16} color="#a78bfa" />
                  </div>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div style={{ padding: "20px 22px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>
              &ldquo;CareerShift AI gave me a roadmap and the confidence to reinvent myself in 3 months.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>S</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Sarah Chen</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Data Entry → UX Designer</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Right panel: form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: 440 }}
        >
          {/* Mobile logo */}
          <div className="signup-mobile-logo">
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 32 }}>
              <div className="nav-logo-icon" style={{ width: 36, height: 36 }}><Zap size={17} color="white" /></div>
              <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>
                CareerShift <span style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
              </span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "48px 32px" }}
              >
                <motion.div animate={{ scale: [0.5, 1.2, 1] }} transition={{ duration: 0.5 }}>
                  <CheckCircle2 size={64} color="#10b981" style={{ margin: "0 auto 20px" }} />
                </motion.div>
                <h2 style={{ fontSize: 26, marginBottom: 10 }}>You&apos;re in! 🎉</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Taking you to your dashboard...</p>
              </motion.div>
            ) : (
              <motion.div key="form">
                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.03em", marginBottom: 8 }}>
                    Create your account
                  </h1>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
                  </p>
                </div>

                <div style={{
                  padding: "32px",
                  background: "rgba(13,13,31,0.75)",
                  border: "1px solid rgba(139,92,246,0.18)",
                  borderRadius: 20,
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}>
                  <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <input
                        {...register("name")}
                        id="signup-name"
                        className="input"
                        placeholder="Alex Johnson"
                        autoComplete="name"
                      />
                      {errors.name && <span className="input-error">{errors.name.message}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input
                        {...register("email")}
                        id="signup-email"
                        type="email"
                        className="input"
                        placeholder="alex@example.com"
                        autoComplete="email"
                      />
                      {errors.email && <span className="input-error">{errors.email.message}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <div style={{ position: "relative" }}>
                        <input
                          {...register("password")}
                          id="signup-password"
                          type={showPw ? "text" : "password"}
                          className="input"
                          placeholder="At least 8 characters"
                          style={{ paddingRight: 48 }}
                          autoComplete="new-password"
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
                      id="signup-submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ marginTop: 4, padding: "14px", fontSize: 15 }}
                    >
                      {loading ? (
                        <><span className="spinner" /> Creating account...</>
                      ) : (
                        <>Create Free Account <ArrowRight size={16} /></>
                      )}
                    </motion.button>
                  </form>

                  <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 20, lineHeight: 1.6 }}>
                    By signing up you agree to our{" "}
                    <Link href="#" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Terms</Link>{" "}
                    and{" "}
                    <Link href="#" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Privacy Policy</Link>.
                  </p>
                </div>

                {/* Trust badges */}
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
                  {["No credit card", "Free forever", "Results in 60s"].map((t) => (
                    <span key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                      <CheckCircle2 size={12} color="#10b981" /> {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <style jsx global>{`
        @media (min-width: 900px) {
          .signup-left-panel { display: flex !important; width: 460px; min-width: 380px; }
          .signup-mobile-logo { display: none; }
        }
        @media (max-width: 899px) {
          .signup-mobile-logo { display: block; }
        }
      `}</style>
    </div>
  );
}
