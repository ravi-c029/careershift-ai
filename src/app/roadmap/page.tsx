"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Link from "next/link";
import {
  Map,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Code,
  Brain,
  ArrowRight,
} from "lucide-react";

interface RoadmapData {
  id: string;
  jobTitle: string;
  inputSkills: string[];
  displacementRisk: number;
  safeAlternatives: Array<{ title: string; match: number }>;
  roadmapData: {
    riskExplanation: string;
    skillGaps: Array<{ skill: string; currentLevel: number; requiredLevel: number; priority: string }>;
    roadmap: Array<{
      week: number;
      title: string;
      focus: string;
      tasks: string[];
      resources: Array<{ name: string; url: string; type: string; free: boolean }>;
    }>;
  };
  createdAt: string;
}

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  course: BookOpen,
  video: Video,
  article: FileText,
  project: Code,
};

function RoadmapContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const roadmapId = searchParams.get("id");
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [selected, setSelected] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/user/roadmap", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const data: RoadmapData[] = res.data.roadmaps || [];
        setRoadmaps(data);
        if (roadmapId) {
          setSelected(data.find((r) => r.id === roadmapId) || data[0] || null);
        } else {
          setSelected(data[0] || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, roadmapId]);

  const toggleWeek = (week: number) => {
    setCompletedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (!selected) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>No Roadmap Yet</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Run your first career analysis to generate a personalized 90-day roadmap.
        </p>
        <Link href="/analyze" className="btn btn-primary btn-lg">
          <Brain size={18} />
          Analyze My Career
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const weeks = selected.roadmapData?.roadmap || [];
  const progress = Math.round((completedWeeks.size / Math.max(weeks.length, 1)) * 100);

  return (
    <div style={{ maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, display: "flex", alignItems: "center", gap: 10 }}>
              <Map size={26} color="var(--accent-cyan)" />
              90-Day Reskilling Roadmap
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
              Career from: <strong>{selected.jobTitle}</strong> · {weeks.length} weeks · {selected.inputSkills.length} skills analyzed
            </p>
          </div>
          {roadmaps.length > 1 && (
            <select
              className="input"
              style={{ maxWidth: 220, fontSize: 13 }}
              value={selected.id}
              onChange={(e) => setSelected(roadmaps.find((r) => r.id === e.target.value) || roadmaps[0])}
            >
              {roadmaps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.jobTitle} — {new Date(r.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Progress */}
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Overall Progress</span>
            <span style={{ fontSize: 14, color: "var(--accent-green)", fontWeight: 700 }}>{progress}%</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 13, color: "var(--text-secondary)" }}>
            <span>✅ {completedWeeks.size} weeks completed</span>
            <span>📅 {weeks.length - completedWeeks.size} weeks remaining</span>
            <span>⏱️ ~{(weeks.length - completedWeeks.size) * 7} days left</span>
          </div>
        </div>

        {/* Month Groups */}
        {[
          { label: "Month 1 — Foundation", weeks: weeks.filter((w) => w.week <= 4) },
          { label: "Month 2 — Building", weeks: weeks.filter((w) => w.week >= 5 && w.week <= 8) },
          { label: "Month 3 — Advanced & Portfolio", weeks: weeks.filter((w) => w.week >= 9) },
        ].map((month) => (
          <div key={month.label} style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 16, color: "var(--accent-purple)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 12 }}>
              {month.label}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {month.weeks.map((week) => {
                const done = completedWeeks.has(week.week);
                return (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      border: `1px solid ${done ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: done ? "rgba(16,185,129,0.05)" : "var(--bg-card)",
                    }}
                  >
                    <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "start" }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: done ? "rgba(16,185,129,0.2)" : "var(--gradient-main)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          color: "white",
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {done ? <CheckCircle2 size={22} /> : `W${week.week}`}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{week.title}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>{week.focus}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tasks</div>
                            {week.tasks.map((t, i) => (
                              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
                                <CheckCircle2 size={12} color={done ? "#10b981" : "#8b5cf6"} style={{ flexShrink: 0, marginTop: 1 }} />
                                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Resources</div>
                            {week.resources.map((r, i) => {
                              const Icon = RESOURCE_ICONS[r.type] || BookOpen;
                              return (
                                <a
                                  key={i}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    fontSize: 12,
                                    color: "var(--text-secondary)",
                                    textDecoration: "none",
                                    marginBottom: 6,
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border)",
                                  }}
                                >
                                  <Icon size={11} color="var(--accent-purple)" />
                                  <span style={{ flex: 1 }}>{r.name}</span>
                                  {r.free && <span style={{ fontSize: 9, color: "#34d399" }}>FREE</span>}
                                  <ExternalLink size={9} color="var(--text-muted)" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleWeek(week.week)}
                        className={done ? "btn btn-sm" : "btn btn-secondary btn-sm"}
                        style={done ? { background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" } : {}}
                      >
                        {done ? "✓ Done" : "Mark Done"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>}>
      <RoadmapContent />
    </Suspense>
  );
}
