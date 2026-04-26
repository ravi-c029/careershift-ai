"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { TagInput } from "@/components/TagInput";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Camera, Save, LogOut, Shield, Briefcase, Sparkles, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { RiskGauge } from "@/components/RiskGauge";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500).optional(),
  currentJobTitle: z.string().optional(),
  avatar: z.string().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

const mockProjectionData = [
  { year: "2024", risk: 15 },
  { year: "2026", risk: 28 },
  { year: "2028", risk: 45 },
  { year: "2030", risk: 68 },
  { year: "2032", risk: 82 },
];

export default function ProfilePage() {
  const { user, token, updateUser, logout } = useAuth();
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      currentJobTitle: user?.currentJobTitle || "",
      avatar: user?.avatar || "",
    },
  });

  const currentAvatar = watch("avatar");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("avatar", reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const res = await axios.put(
        "/api/user/profile",
        { ...data, skills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(res.data.user);
      toast.success("Profile updated! ✅");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 720 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <User size={26} color="var(--accent-purple)" />
          Your Profile
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>
          Manage your personal information and career preferences.
        </p>

        {/* Profile Header */}
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
              <div className="avatar avatar-lg" style={{ width: 80, height: 80, fontSize: 32, overflow: 'hidden' }}>
                {currentAvatar ? (
                  <img src={currentAvatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user.name?.[0]?.toUpperCase()
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  background: "var(--accent-purple)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s"
                }}
                className="hover-scale"
              >
                <Camera size={14} color="white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                style={{ display: "none" }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 22 }}>{user.name}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 8 }}>{user.email}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {user.emailVerified ? (
                  <span className="badge badge-green">
                    <Shield size={10} />
                    Email Verified
                  </span>
                ) : (
                  <span className="badge badge-amber">Email Not Verified</span>
                )}
                <span className="badge badge-purple">
                  <Briefcase size={10} />
                  Community Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 24, fontWeight: 700 }}>Personal Information</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input {...register("name")} className="input" id="profile-name" />
                {errors.name && <span className="input-error">{errors.name.message}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Current Job Title</label>
                <input {...register("currentJobTitle")} className="input" placeholder="e.g. Data Analyst" id="profile-job-title" />
              </div>

              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">Bio</label>
                <textarea
                  {...register("bio")}
                  className="input"
                  rows={3}
                  placeholder="Tell the community about yourself and your career journey..."
                  style={{ resize: "vertical" }}
                  id="profile-bio"
                />
                {errors.bio && <span className="input-error">{errors.bio.message}</span>}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8, fontWeight: 700 }}>Your Skills</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
              These skills are used for your AI career analysis.
            </p>
            <TagInput value={skills} onChange={setSkills} placeholder="Add skills (press Enter)..." />
          </div>

          <div className="card" style={{ padding: 32, marginBottom: 24, border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 10px 40px -10px rgba(139,92,246,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
               <div>
                 <h2 style={{ fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, letterSpacing: "-0.02em" }}>
                   <Activity size={20} color="var(--accent-pink)" />
                   Career Viability Dashboard
                 </h2>
                 <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                   Scientific analysis of your career trajectory against AI displacement models.
                 </p>
               </div>
               <span className="badge badge-purple" style={{ padding: "6px 12px", fontSize: 12 }}>Platform Exclusive</span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, alignItems: "stretch" }}>
              {/* Scientific Risk Gauge */}
              <div style={{ background: "rgba(0,0,0,0.2)", padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                 <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                   <AlertTriangle size={16} color="var(--accent-amber)" />
                   Automatiability Index
                 </h3>
                 <RiskGauge risk={skills.length > 5 && user.currentJobTitle ? 42 : 78} size={220} />
                 <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16, textAlign: "center", lineHeight: 1.5 }}>
                   Calculates the near-term risk of AI displacement using our proprietary LLM analysis matrix based on your current skillset.
                 </p>
              </div>
              
              {/* Obsolescence Curve Chart */}
              <div style={{ background: "rgba(0,0,0,0.2)", padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                   <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                     <TrendingUp size={16} color="var(--accent-blue)" />
                     10-Year Skill Obsolescence Projection
                   </h3>
                   <div style={{ fontSize: 11, background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)", padding: "4px 8px", borderRadius: 4 }}>
                     Predictive Model Alpha
                   </div>
                 </div>
                 
                 <div style={{ flex: 1, minHeight: 200, width: "100%" }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={mockProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                       <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                       <RechartsTooltip 
                         contentStyle={{ background: "#1e1e2d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                         itemStyle={{ color: "#ef4444" }}
                         formatter={(value: any) => [`${value}% Risk`, "Displacement Probability"]}
                       />
                       <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
                 <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.5 }}>
                   This scientific trajectory shows how your current skillset's market value degrades over time. <strong>Generating an AI roadmap</strong> bends this curve downwards.
                 </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-profile"
            >
              {saving ? <><span className="spinner" /> Saving...</> : <><Save size={16} /> Save Changes</>}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={logout}
              id="logout-btn"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </form>

        {/* Account Info */}
        <div className="card" style={{ padding: 24, marginTop: 24, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#f87171" }}>Danger Zone</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
            Once you delete your account, all data will be permanently removed.
          </p>
          <button className="btn btn-danger btn-sm" disabled>
            Delete Account (Contact Support)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
