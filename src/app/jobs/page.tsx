"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  url: string;
  description: string;
  tags: string[];
  aiSafeScore: number;
  postedAt: string;
}

export default function JobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [country, setCountry] = useState("in"); // Default to India

  const fetchJobs = async (q = filter, p = 1, c = country, replace = true) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/jobs?filter=${encodeURIComponent(q)}&page=${p}&country=${c}`);
      const data = res.data;
      setJobs((prev) => replace ? data.jobs : [...prev, ...data.jobs]);
      setHasMore(p < data.pages);
      setTotal(data.total);
    } catch {}
  };

  const fetchSaved = async () => {
    if (!token) return;
    try {
      const res = await axios.get("/api/jobs/saved", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedIds(new Set(res.data.jobs.map((j: { jobId: string }) => j.jobId)));
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchJobs(), fetchSaved()]).finally(() => setLoading(false));
  }, []);

  const handleSearch = (val: string) => {
    setFilter(val);
    setPage(1);
    fetchJobs(val, 1, country, true);
  };

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setPage(1);
    fetchJobs(filter, 1, val, true);
  };

  const handleSave = async (job: Job) => {
    if (!token) return toast.error("Please log in to save jobs");
    const alreadySaved = savedIds.has(job.id);
    if (alreadySaved) {
      setSavedIds((prev) => { const n = new Set(prev); n.delete(job.id); return n; });
      toast.success("Job unsaved");
      return;
    }
    try {
      await axios.post(
        "/api/jobs/saved",
        { jobId: job.id, jobTitle: job.title, company: job.company, location: job.location, url: job.url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedIds((prev) => new Set([...prev, job.id]));
      toast.success("Job saved! ✅");
    } catch {
      toast.error("Failed to save job");
    }
  };

  const scoreColor = (score: number) =>
    score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ maxWidth: 1000 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <Briefcase size={26} color="var(--accent-amber)" />
          AI-Safe Job Board
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>
          Curated roles in careers with high resistance to AI automation. Updated daily.
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Jobs Listed", value: total, icon: Briefcase },
            { label: "Avg AI-Safe Score", value: "87%", icon: TrendingUp },
            { label: "New This Week", value: "24", icon: Search },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ padding: 16 }}>
              <s.icon size={16} color="var(--accent-purple)" />
              <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
              <div className="stat-label" style={{ fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              id="jobs-search"
              className="input"
              placeholder="Search by role or skill (e.g. Python, UX, AI...)"
              value={filter}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ paddingLeft: 40, fontSize: 14 }}
            />
          </div>
          
          <div style={{ position: "relative", width: 140 }}>
            <MapPin size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <select
              className="input"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              style={{ paddingLeft: 40, fontSize: 14, appearance: "none", cursor: "pointer" }}
            >
              <option value="in">India 🇮🇳</option>
              <option value="us">USA 🇺🇸</option>
              <option value="gb">UK 🇬🇧</option>
              <option value="ca">Canada 🇨🇦</option>
              <option value="au">Australia 🇦🇺</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 }}>
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{job.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{job.company}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: `${scoreColor(job.aiSafeScore)}22`,
                          color: scoreColor(job.aiSafeScore),
                          border: `1px solid ${scoreColor(job.aiSafeScore)}44`,
                        }}
                      >
                        🛡️ {job.aiSafeScore}%
                      </div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} /> {job.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <DollarSign size={11} /> {job.salary}
                    </span>
                    <span className="badge badge-cyan" style={{ fontSize: 10 }}>{job.type}</span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {job.description.slice(0, 150)}...
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {job.tags.map((tag) => (
                      <span key={tag} className="badge badge-purple" style={{ fontSize: 10 }}>{tag}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      Apply Now <ExternalLink size={12} />
                    </a>
                    <button
                      className={savedIds.has(job.id) ? "btn btn-sm" : "btn btn-secondary btn-sm"}
                      onClick={() => handleSave(job)}
                      style={savedIds.has(job.id) ? { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" } : {}}
                    >
                      {savedIds.has(job.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {jobs.length === 0 && (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  No jobs found for "{filter}". Try a different search term.
                </p>
              </div>
            )}

            {hasMore && (
              <button
                className="btn btn-secondary btn-full"
                style={{ marginTop: 24 }}
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchJobs(filter, nextPage, country, false);
                }}
              >
                Load More Jobs
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
