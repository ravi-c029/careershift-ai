"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { TagInput } from "@/components/TagInput";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Camera, Save, LogOut, Shield, Briefcase } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500).optional(),
  currentJobTitle: z.string().optional(),
  avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, token, updateUser, logout } = useAuth();
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
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
            <div style={{ position: "relative" }}>
              <div className="avatar avatar-lg" style={{ width: 80, height: 80, fontSize: 32 }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user.name?.[0]?.toUpperCase()
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  background: "var(--gradient-main)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Camera size={12} color="white" />
              </div>
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

              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">Avatar URL</label>
                <input
                  {...register("avatar")}
                  className="input"
                  placeholder="https://example.com/your-photo.jpg"
                  id="profile-avatar"
                />
                {errors.avatar && <span className="input-error">{errors.avatar.message}</span>}
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
