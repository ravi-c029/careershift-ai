"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { RiskGauge } from "@/components/RiskGauge";
import {
  Brain,
  Map,
  Users,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react";
import axios from "axios";

interface RoadmapSummary {
  id: string;
  jobTitle: string;
  displacementRisk: number;
  createdAt: string;
  inputSkills: string[];
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);

  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/user/roadmap", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRoadmaps(res.data.roadmaps || []))
      .catch(() => {})
      .finally(() => setLoadingRoadmaps(false));
  }, [token]);

  const latestRoadmap = roadmaps[0];

  const quickLinks = [
    {
      href: "/analyze",
      icon: Brain,
      title: "Analyze My Career",
      desc: "Get your AI risk score and roadmap",
      color: "#8b5cf6",
    },
    {
      href: "/roadmap",
      icon: Map,
      title: "My Roadmap",
      desc: "View your 90-day reskilling plan",
      color: "#06b6d4",
    },
    {
      href: "/community",
      icon: Users,
      title: "Community",
      desc: "Connect with 50K+ professionals",
      color: "#10b981",
    },
    {
      href: "/jobs",
      icon: Briefcase,
      title: "AI-Safe Jobs",
      desc: "Browse curated job listings",
      color: "#f59e0b",
    },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.08))",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 20,
          padding: 32,
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div className="nav-logo-icon" style={{ width: 28, height: 28 }}>
              <Zap size={14} color="white" />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>
            Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {user?.currentJobTitle
              ? `Tracking your career as ${user.currentJobTitle}`
              : "Start by analyzing your career to get your AI risk score"}
          </p>
        </div>
        <Link href="/analyze" className="btn btn-primary">
          <Brain size={16} />
          {latestRoadmap ? "Re-Analyze Career" : "Analyze My Career"}
          <ArrowRight size={16} />
        </Link>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Analyses Run", value: roadmaps.length, icon: TrendingUp, color: "#8b5cf6" },
          { label: "Skills on File", value: user?.skills?.length || 0, icon: Brain, color: "#06b6d4" },
          { label: "Days Active", value: Math.floor((Date.now() - new Date(user?.skills ? Date.now() : Date.now()).getTime()) / 86400000) || 1, icon: Calendar, color: "#10b981" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <stat.icon size={20} color={stat.color} />
            <div className="stat-value" style={{ fontSize: 28 }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Risk Score Card */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{ fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={16} color="var(--accent-purple)" />
            Your AI Risk Score
          </h2>
          {loadingRoadmaps ? (
            <div className="skeleton" style={{ height: 150, borderRadius: 12 }} />
          ) : latestRoadmap ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <RiskGauge risk={latestRoadmap.displacementRisk} size={220} />
              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                Based on: <strong style={{ color: "var(--text-secondary)" }}>{latestRoadmap.jobTitle}</strong>
              </p>
              <Link href="/analyze" className="btn btn-secondary btn-sm">
                Update Analysis <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
                No analysis yet. Run your first career analysis to see your risk score.
              </p>
              <Link href="/analyze" className="btn btn-primary btn-sm">
                Analyze Now <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Latest Roadmap Card */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 style={{ fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Map size={16} color="var(--accent-cyan)" />
            Latest Roadmap
          </h2>
          {loadingRoadmaps ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />
              ))}
            </div>
          ) : latestRoadmap ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  Analyzing:
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{latestRoadmap.jobTitle}</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {latestRoadmap.inputSkills.slice(0, 5).map((skill) => (
                  <span key={skill} className="badge badge-purple" style={{ fontSize: 11 }}>
                    {skill}
                  </span>
                ))}
                {latestRoadmap.inputSkills.length > 5 && (
                  <span className="badge badge-purple" style={{ fontSize: 11 }}>
                    +{latestRoadmap.inputSkills.length - 5} more
                  </span>
                )}
              </div>
              <Link href={`/roadmap?id=${latestRoadmap.id}`} className="btn btn-primary btn-sm btn-full">
                View Full Roadmap <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Your personalized 90-day roadmap will appear here after analysis.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 16, fontWeight: 700 }}>Quick Access</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {quickLinks.map(({ href, icon: Icon, title, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="card"
              style={{ textDecoration: "none", display: "flex", gap: 14 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${color}22`,
                  border: `1px solid ${color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
