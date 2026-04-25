"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { TagInput } from "@/components/TagInput";
import { RiskGauge } from "@/components/RiskGauge";
import { SkillRadar } from "@/components/SkillRadar";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Brain,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Code,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Link as LinkIcon,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/openai";

const RESOURCE_ICONS = {
  course: BookOpen,
  video: Video,
  article: FileText,
  project: Code,
};

const PRIORITY_COLORS = {
  high: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.3)" },
  medium: { bg: "rgba(245,158,11,0.1)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  low: { bg: "rgba(16,185,129,0.1)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
};

export default function AnalyzePage() {
  const { token } = useAuth();
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(AnalysisResult & { roadmapId?: string }) | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [showLinkedInSync, setShowLinkedInSync] = useState(false);
  const [pivotMode, setPivotMode] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  const handleLinkedInSync = async () => {
    if (!linkedInUrl.trim()) return toast.error("Please enter a LinkedIn URL");
    if (!linkedInUrl.includes("linkedin.com/in/")) return toast.error("Please enter a valid LinkedIn Profile URL (e.g. linkedin.com/in/username)");
    
    setSyncing(true);
    try {
      const res = await axios.post("/api/analyze/linkedin", { url: linkedInUrl });
      if (res.data.jobTitle) setJobTitle(res.data.jobTitle);
      if (res.data.skills && Array.isArray(res.data.skills)) {
        // Merge skills without duplicates
        const newSkills = [...new Set([...skills, ...res.data.skills])];
        setSkills(newSkills);
      }
      toast.success("Profile synced successfully! ✨");
      setShowLinkedInSync(false);
      setLinkedInUrl("");
    } catch (err) {
      toast.error("Failed to sync profile. Try manual entry.");
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobTitle.trim()) return toast.error("Please enter your job title");
    if (skills.length < 1) return toast.error("Please add at least one skill");
    if (!token) return toast.error("Please log in first");

    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(
        "/api/analyze",
        { jobTitle, skills, targetRole: pivotMode ? targetRole : undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
      toast.success("Analysis complete! 🎉");
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Analysis failed. Check your OpenAI API key.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTED_SKILLS = [
    "Python", "Excel", "SQL", "JavaScript", "Data Analysis",
    "Project Management", "Communication", "Leadership", "Marketing", "Sales",
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <Brain size={28} color="var(--accent-purple)" />
          Career Analysis
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32 }}>
          Enter your current role and skills. Our AI will calculate your displacement risk and build your personalized roadmap.
        </p>

        {/* Input Form */}
        <div className="card" style={{ padding: 32, marginBottom: 32 }}>
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={() => setShowLinkedInSync(!showLinkedInSync)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: showLinkedInSync ? "rgba(139,92,246,0.15)" : "" }}
            >
              <LinkIcon size={14} color="#38bdf8" />
              {showLinkedInSync ? "Close Auto-Sync" : "Auto-Sync with LinkedIn"}
            </button>
          </div>

          <AnimatePresence>
            {showLinkedInSync && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden", marginBottom: 24 }}
              >
                <div style={{ background: "rgba(56,189,248,0.05)", padding: 16, borderRadius: 12, border: "1px solid rgba(56,189,248,0.2)", display: "flex", gap: 12 }}>
                  <input
                    className="input"
                    placeholder="https://www.linkedin.com/in/username"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={handleLinkedInSync}
                    disabled={syncing}
                    style={{ minWidth: 100 }}
                  >
                    {syncing ? <span className="spinner" /> : "Sync"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="input-label" style={{ marginBottom: 0 }}>
                  Current Job Title *
                </label>
                <button
                  className="btn btn-sm"
                  onClick={() => setPivotMode(!pivotMode)}
                  style={{
                    background: pivotMode ? "var(--gradient-main)" : "rgba(255,255,255,0.05)",
                    border: "none",
                    color: "white",
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 999,
                  }}
                >
                  🎯 Pivot Mode
                </button>
              </div>
              <input
                id="job-title-input"
                className="input"
                placeholder="e.g. Data Entry Specialist, Paralegal, Accountant..."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                style={{ fontSize: 16, marginTop: 8 }}
              />
            </div>

            <AnimatePresence>
              {pivotMode && (
                <motion.div
                  className="input-group"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ gridColumn: "1 / -1", overflow: "hidden" }}
                >
                  <label className="input-label" style={{ marginTop: 8 }}>Target Career / Pivot Goal *</label>
                  <input
                    className="input"
                    placeholder="e.g. UX Designer, Cloud Architect..."
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    style={{ fontSize: 16, border: "1px solid var(--accent-purple)" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label className="input-label">
                Your Skills * &nbsp;
                <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                  (press Enter or comma after each)
                </span>
              </label>
              <TagInput value={skills} onChange={setSkills} placeholder="Type a skill and press Enter..." />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 4 }}>Quick add:</span>
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSkills([...skills, s])}
                    className="badge badge-cyan"
                    style={{ cursor: "pointer", background: "none", border: "1px solid rgba(6,182,212,0.3)", color: "#22d3ee" }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            id="analyze-submit"
            className="btn btn-primary btn-lg"
            onClick={handleAnalyze}
            disabled={loading}
            style={{ marginTop: 24, minWidth: 220 }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing with GPT-4...
              </>
            ) : (
              <>
                <Brain size={18} />
                Analyze My Career
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}
            >
              🤖 GPT-4 is analyzing your career profile... This takes ~15–30 seconds.
            </motion.p>
          )}
        </div>

        {/* RESULTS */}
        <AnimatePresence>
          {result && (
            <motion.div
              id="results-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Risk Score */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, marginBottom: 24 }}>
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
                  <h2 style={{ fontSize: 15, marginBottom: 20, color: "var(--text-secondary)" }}>
                    AI Displacement Risk
                  </h2>
                  <RiskGauge risk={result.displacementRisk} size={260} />
                </div>
                <div className="card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={16} color="#f59e0b" />
                    Risk Explanation
                  </h2>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 14 }}>
                    {result.riskExplanation}
                  </p>
                  <div style={{ marginTop: 20 }}>
                    <div
                      style={{
                        padding: "12px 16px",
                        background: result.displacementRisk >= 70
                          ? "rgba(239,68,68,0.08)"
                          : result.displacementRisk >= 40
                          ? "rgba(245,158,11,0.08)"
                          : "rgba(16,185,129,0.08)",
                        border: `1px solid ${result.displacementRisk >= 70 ? "rgba(239,68,68,0.3)" : result.displacementRisk >= 40 ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
                        borderRadius: 10,
                        fontSize: 13,
                      }}
                    >
                      <strong>{result.displacementRisk}% displacement risk</strong> — Your role is {
                        result.displacementRisk >= 70 ? "highly vulnerable to AI automation. Act now." :
                        result.displacementRisk >= 40 ? "moderately at risk. Start reskilling soon." :
                        "relatively safe, but staying ahead is wise."
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Safe Alternatives */}
              <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={18} color="var(--accent-green)" />
                  Top 5 AI-Safe Career Alternatives
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>
                  Matched to your existing skills profile
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {result.safeAlternatives.map((alt, i) => (
                    <motion.div
                      key={alt.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        padding: 20,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>{alt.title}</h3>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: `rgba(16,185,129,${alt.match / 200})`,
                            color: "#34d399",
                            border: "1px solid rgba(16,185,129,0.3)",
                            flexShrink: 0,
                          }}
                        >
                          {alt.match}% match
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                        {alt.description}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
                        <span>💰 {alt.avgSalary}</span>
                        <span>📈 {alt.growth}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {alt.requiredSkills.slice(0, 4).map((sk) => (
                          <span key={sk} className="badge badge-purple" style={{ fontSize: 10 }}>{sk}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skill Gap Radar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div className="card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 18, marginBottom: 4 }}>Skill Gap Analysis</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>
                    Purple = required | Cyan = your current level
                  </p>
                  <SkillRadar skillGaps={result.skillGaps} />
                </div>
                <div className="card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 18, marginBottom: 20 }}>Skills to Develop</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {result.skillGaps.map((sg) => {
                      const colors = PRIORITY_COLORS[sg.priority];
                      const gap = sg.requiredLevel - sg.currentLevel;
                      return (
                        <div key={sg.skill}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                            <span>{sg.skill}</span>
                            <span
                              style={{
                                fontSize: 10,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              {sg.priority} priority
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${sg.currentLevel}%`, background: "var(--accent-cyan)" }}
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                            <span>Current: {sg.currentLevel}%</span>
                            <span>Gap: +{gap}% needed</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 90-Day Roadmap */}
              <div className="card" style={{ padding: 32 }}>
                <h2 style={{ fontSize: 20, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  🗺️ Your 90-Day Reskilling Roadmap
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>
                  A week-by-week plan with free resources. Click a week to expand.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.roadmap.map((week) => (
                    <div
                      key={week.week}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        overflow: "hidden",
                        transition: "border-color 0.2s",
                        borderColor: expandedWeek === week.week ? "rgba(139,92,246,0.5)" : undefined,
                      }}
                    >
                      <button
                        onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                        style={{
                          width: "100%",
                          padding: "16px 20px",
                          background: expandedWeek === week.week ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: expandedWeek === week.week ? "var(--gradient-main)" : "rgba(139,92,246,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          W{week.week}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{week.title}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{week.focus}</div>
                        </div>
                        {expandedWeek === week.week ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                      </button>

                      <AnimatePresence>
                        {expandedWeek === week.week && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ padding: "20px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                              <div>
                                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--text-secondary)" }}>
                                  THIS WEEK&apos;S TASKS
                                </h4>
                                {week.tasks.map((task, ti) => (
                                  <div key={ti} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                                    <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{task}</span>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--text-secondary)" }}>
                                  FREE RESOURCES
                                </h4>
                                {week.resources.map((res, ri) => {
                                  const Icon = RESOURCE_ICONS[res.type] || BookOpen;
                                  const targetUrl = (res as any).searchQuery
                                    ? (res.type === "video" 
                                        ? `https://www.youtube.com/results?search_query=${encodeURIComponent((res as any).searchQuery)}`
                                        : `https://www.google.com/search?q=${encodeURIComponent((res as any).searchQuery)}`)
                                    : (res as any).url || "#";
                                  
                                  return (
                                    <a
                                      key={ri}
                                      href={targetUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "8px 10px",
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 8,
                                        marginBottom: 6,
                                        textDecoration: "none",
                                        transition: "background 0.2s",
                                      }}
                                    >
                                      <Icon size={13} color="var(--accent-purple)" />
                                      <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{res.name}</span>
                                      {res.free && <span className="badge badge-green" style={{ fontSize: 9 }}>FREE</span>}
                                      <ExternalLink size={10} color="var(--text-muted)" />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
