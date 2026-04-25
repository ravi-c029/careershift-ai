"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  useMotionValue,
} from "framer-motion";
import {
  Brain, Map, Users, Briefcase, TrendingUp, Shield,
  ArrowRight, Star, CheckCircle2, Zap, Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navigation";
import { InteractiveBackground } from "@/components/InteractiveBackground";

/* ── reusable reveal wrapper ── */
function Reveal({
  children,
  delay = 0,
  y = 40,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── floating badge ── */
function FloatingBadge({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-flex" }}
    >
      {children}
    </motion.div>
  );
}

/* ── magnetic button ── */
function MagneticBtn({ children, href, className }: { children: React.ReactNode; href: string; className: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22 });
  const sy = useSpring(y, { stiffness: 180, damping: 22 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.a>
  );
}

/* ── feature card ── */
const features = [
  { icon: Brain, title: "AI Risk Analysis", desc: "GPT-4 calculates your exact displacement risk score and pinpoints which tasks in your role are most vulnerable to automation.", color: "#8b5cf6", glow: "rgba(139,92,246,0.25)" },
  { icon: TrendingUp, title: "Safe Career Paths", desc: "Discover 5 AI-proof career alternatives hand-matched to your existing skills — with salary data and 2030 growth projections.", color: "#06b6d4", glow: "rgba(6,182,212,0.25)" },
  { icon: Map, title: "90-Day Roadmap", desc: "Week-by-week reskilling plan with curated free resources, hands-on projects, and clear milestones you can actually follow.", color: "#10b981", glow: "rgba(16,185,129,0.25)" },
  { icon: Users, title: "Community Support", desc: "50,000+ professionals in the same boat. Share wins, ask questions, find accountability partners and mentors.", color: "#f59e0b", glow: "rgba(245,158,11,0.25)" },
  { icon: Briefcase, title: "AI-Safe Job Board", desc: "Curated listings in roles that are resistant to automation — filtered and scored for their AI safety index.", color: "#ec4899", glow: "rgba(236,72,153,0.25)" },
  { icon: Shield, title: "Skill Gap Radar", desc: "Visual radar chart comparing your current proficiency to what each target role requires — so you know exactly what to study.", color: "#a78bfa", glow: "rgba(167,139,250,0.25)" },
];

const testimonials = [
  { name: "Sarah Chen", role: "Data Entry → UX Designer", avatar: "S", quote: "CareerShift AI gave me a roadmap and the confidence to completely reinvent myself in 3 months. Now I earn 40% more.", stars: 5 },
  { name: "Marcus Johnson", role: "Paralegal → AI Legal Analyst", avatar: "M", quote: "The risk score was a wake-up call. The roadmap was my lifeline. I landed a new job before my firm automated my role.", stars: 5 },
  { name: "Priya Patel", role: "Accountant → ML Engineer", avatar: "P", quote: "The community alone is worth it. I found mentors, accountability partners, and my current job through CareerShift AI.", stars: 5 },
];

const stats = [
  { value: "85M+", label: "Jobs at risk by 2025", color: "#ef4444" },
  { value: "67%", label: "Of tasks automatable", color: "#f59e0b" },
  { value: "12 wks", label: "Average to reskill", color: "#10b981" },
  { value: "97%", label: "User satisfaction", color: "#8b5cf6" },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <>
      <InteractiveBackground />
      <Navbar />

      <main style={{ position: "relative", zIndex: 1 }}>
        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section
          ref={heroRef}
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "120px 24px 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Radial glow behind text */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity, position: "relative", zIndex: 1, textAlign: "center", maxWidth: 820 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              style={{ marginBottom: 28, display: "flex", justifyContent: "center" }}
            >
              <FloatingBadge>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "7px 18px", borderRadius: 999,
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  fontSize: 13, fontWeight: 600, color: "#a78bfa",
                  backdropFilter: "blur(10px)",
                }}>
                  <Sparkles size={13} />
                  Powered by GPT-4o · Join 50,000+ professionals
                  <Sparkles size={13} />
                </span>
              </FloatingBadge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(40px, 7vw, 80px)", lineHeight: 1.06, letterSpacing: "-0.04em", marginBottom: 28 }}
            >
              AI Is Coming{" "}
              <span style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 60%, #a78bfa 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                For Your Job.
              </span>
              <br />
              <span style={{ color: "var(--text-primary)" }}>Let's Fight Back.</span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.65 }}
            >
              Discover your AI displacement risk, find career paths that AI can&apos;t touch,
              and get a personalized week-by-week plan to get there — all in 60 seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}
            >
              <MagneticBtn href="/signup" className="btn btn-primary btn-lg">
                Analyze My Career — Free
                <ArrowRight size={18} />
              </MagneticBtn>
              <MagneticBtn href="/community" className="btn btn-secondary btn-lg">
                Join the Community
              </MagneticBtn>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}
            >
              {["No credit card", "Results in 60s", "Free forever"].map((t) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                  <CheckCircle2 size={13} color="#10b981" /> {t}
                </span>
              ))}
            </motion.div>

            {/* Hero preview card */}
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginTop: 72 }}
            >
              <div style={{
                maxWidth: 680, margin: "0 auto",
                background: "rgba(13,13,31,0.75)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: 24, padding: "28px 32px",
                boxShadow: "0 40px 120px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}>
                {/* Mac dots */}
                <div style={{ display: "flex", gap: 7, marginBottom: 22 }}>
                  {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
                    <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
                  ))}
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 10, alignSelf: "center" }}>
                    CareerShift AI · Analyzing: <em>Data Entry Specialist</em>
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { label: "AI Displacement Risk", value: "78%", sub: "High — Act Now", color: "#ef4444" },
                    { label: "Best Career Match", value: "UX Design", sub: "89% skill match", color: "#10b981" },
                    { label: "Skill Gaps Found", value: "6", sub: "Identified gaps", color: "#8b5cf6" },
                    { label: "Weeks to Transition", value: "12", sub: "Personalised plan", color: "#06b6d4" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.1, duration: 0.5, ease: "backOut" }}
                      style={{
                        padding: "16px 18px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 14,
                      }}
                    >
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: item.color, lineHeight: 1, marginBottom: 4 }}>{item.value}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.sub}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════
            STATS TICKER
        ══════════════════════════════════════ */}
        <section style={{ borderTop: "1px solid rgba(139,92,246,0.12)", borderBottom: "1px solid rgba(139,92,246,0.12)", padding: "40px 0", backdropFilter: "blur(8px)", background: "rgba(5,5,15,0.5)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 0 }}>
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.1}>
                  <div style={{ textAlign: "center", padding: "8px 0", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <div style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FEATURES
        ══════════════════════════════════════ */}
        <section className="section" style={{ position: "relative" }}>
          <div className="container">
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 70 }}>
                <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Features</span>
                <h2 style={{ fontSize: "clamp(30px,5vw,52px)", marginTop: 12, marginBottom: 16, letterSpacing: "-0.03em" }}>
                  Everything to{" "}
                  <span style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Future-Proof
                  </span>{" "}
                  your career
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
                  One platform. From AI risk analysis to community support — built for the age of disruption.
                </p>
              </div>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.08} y={50}>
                  <motion.div
                    whileHover={{ y: -6, boxShadow: `0 24px 60px ${f.glow}` }}
                    transition={{ duration: 0.25 }}
                    style={{
                      padding: "28px 26px", borderRadius: 20,
                      background: "rgba(13,13,31,0.6)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      backdropFilter: "blur(12px)",
                      cursor: "default",
                      height: "100%",
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: `rgba(${f.color === "#8b5cf6" ? "139,92,246" : f.color === "#06b6d4" ? "6,182,212" : f.color === "#10b981" ? "16,185,129" : f.color === "#f59e0b" ? "245,158,11" : f.color === "#ec4899" ? "236,72,153" : "167,139,250"},0.15)`,
                      border: `1px solid ${f.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                    }}>
                      <f.icon size={22} color={f.color} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.01em" }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════ */}
        <section className="section" style={{ background: "rgba(8,8,20,0.5)", borderTop: "1px solid rgba(139,92,246,0.08)" }}>
          <div className="container">
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <span style={{ fontSize: 12, color: "#06b6d4", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Process</span>
                <h2 style={{ fontSize: "clamp(28px,5vw,50px)", marginTop: 12, letterSpacing: "-0.03em" }}>
                  From fear to{" "}
                  <span style={{ background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    clarity
                  </span>{" "}
                  in 4 steps
                </h2>
              </div>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 40, position: "relative" }}>
              {[
                { n: "01", t: "Enter your role", d: "Tell us your job title and list your current skills." },
                { n: "02", t: "AI scores your risk", d: "GPT-4o calculates displacement risk and vulnerable tasks." },
                { n: "03", t: "Get your roadmap", d: "Receive a 90-day, week-by-week personalised reskilling plan." },
                { n: "04", t: "Join & land the job", d: "Connect with the community and apply to AI-safe roles." },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 0.13} y={40}>
                  <div style={{ textAlign: "center" }}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      style={{
                        width: 68, height: 68, borderRadius: "50%",
                        background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px",
                        fontSize: 20, fontWeight: 900, color: "white",
                        boxShadow: "0 12px 40px rgba(139,92,246,0.35)",
                      }}
                    >
                      {s.n}
                    </motion.div>
                    <h3 style={{ fontSize: 17, marginBottom: 10, letterSpacing: "-0.01em" }}>{s.t}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════ */}
        <section className="section">
          <div className="container">
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Stories</span>
                <h2 style={{ fontSize: "clamp(28px,5vw,50px)", marginTop: 12, letterSpacing: "-0.03em" }}>
                  Real people.{" "}
                  <span style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Real transformations.
                  </span>
                </h2>
              </div>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.12} y={40}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    style={{
                      padding: "28px 26px", borderRadius: 20,
                      background: "rgba(13,13,31,0.7)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                      {Array.from({ length: t.stars }).map((_, si) => (
                        <Star key={si} size={15} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 22, fontStyle: "italic" }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 17, color: "white", flexShrink: 0,
                      }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.role}</div>
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CTA BANNER
        ══════════════════════════════════════ */}
        <section style={{
          padding: "100px 24px",
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(139,92,246,0.14) 0%, transparent 70%)",
          borderTop: "1px solid rgba(139,92,246,0.1)",
          textAlign: "center",
          position: "relative",
        }}>
          <Reveal y={60}>
            <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Get started free</span>
            <h2 style={{ fontSize: "clamp(32px,6vw,64px)", margin: "16px auto 20px", letterSpacing: "-0.04em", maxWidth: 720, lineHeight: 1.08 }}>
              Don&apos;t wait until it&apos;s{" "}
              <span style={{ background: "linear-gradient(135deg,#ef4444,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                too late.
              </span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.65 }}>
              Your next career move starts with knowing your risk. Run your free analysis in 60 seconds.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
              <Link href="/signup" className="btn btn-primary btn-lg" style={{ fontSize: 17, padding: "16px 40px", borderRadius: 14, boxShadow: "0 0 60px rgba(139,92,246,0.5)" }}>
                <Zap size={18} />
                Start My Free Analysis
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          <div className="container">
            <p>© 2024 CareerShift AI · Built to help humans thrive in the age of AI.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
