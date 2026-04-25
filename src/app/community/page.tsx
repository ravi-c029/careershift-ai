"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { timeAgo } from "@/lib/utils";
import {
  Users,
  Heart,
  MessageCircle,
  Trash2,
  Send,
  ChevronDown,
} from "lucide-react";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string };
}

interface Post {
  id: string;
  content: string;
  likesCount: number;
  liked: boolean;
  createdAt: string;
  user: { id: string; name: string; avatar?: string; currentJobTitle?: string };
  comments: Comment[];
}

function Avatar({ user, size = 40 }: { user: { name: string; avatar?: string | null }; size?: number }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function CommunityPage() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  const fetchPosts = async (p: number, replace = false) => {
    try {
      const res = await axios.get(`/api/posts?page=${p}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = res.data;
      setPosts((prev) => replace ? data.posts : [...prev, ...data.posts]);
      setHasMore(p < data.pages);
    } catch {}
  };

  useEffect(() => {
    fetchPosts(1, true).finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!token) return toast.error("Please log in first");
    setPosting(true);
    try {
      const res = await axios.post(
        "/api/posts",
        { content: newPost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => [{ ...res.data.post, liked: false }, ...prev]);
      setNewPost("");
      toast.success("Post published! 🎉");
    } catch {
      toast.error("Failed to post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!token) return toast.error("Please log in to like");
    const res = await axios.post(
      `/api/posts/${postId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: res.data.liked, likesCount: p.likesCount + (res.data.liked ? 1 : -1) }
          : p
      )
    );
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await axios.delete(`/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast.success("Post deleted");
  };

  const handleComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    if (!token) return toast.error("Please log in");
    setSubmittingComment(postId);
    try {
      const res = await axios.post(
        `/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...p.comments, res.data.comment] }
            : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch {
      toast.error("Failed to comment");
    } finally {
      setSubmittingComment(null);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <Users size={26} color="var(--accent-green)" />
          Community
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>
          Connect with 50,000+ professionals navigating AI career disruption together.
        </p>

        {/* Create Post */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 14 }}>
            {user && <Avatar user={user} size={44} />}
            <div style={{ flex: 1 }}>
              <textarea
                className="input"
                placeholder="Share your experience, ask a question, or celebrate a win... 🎉"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={3}
                style={{ resize: "vertical", marginBottom: 12 }}
                id="new-post-input"
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-primary"
                  onClick={handlePost}
                  disabled={posting || !newPost.trim()}
                  id="post-submit"
                >
                  {posting ? <><span className="spinner" /> Posting...</> : <><Send size={14} /> Post</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AnimatePresence>
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  className="post-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i < 5 ? i * 0.05 : 0 }}
                >
                  {/* Post Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <Avatar user={post.user} size={44} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{post.user.name}</div>
                        {post.user.currentJobTitle && (
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {post.user.currentJobTitle}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          {timeAgo(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    {user?.id === post.user.id && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(post.id)}
                        style={{ color: "var(--accent-red)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 16, whiteSpace: "pre-wrap" }}>
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: post.liked ? "#f87171" : "var(--text-muted)",
                        fontSize: 13,
                        transition: "color 0.2s",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <Heart size={15} fill={post.liked ? "#f87171" : "none"} />
                      {post.likesCount}
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: expandedComments.has(post.id) ? "var(--accent-purple)" : "var(--text-muted)",
                        fontSize: 13,
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <MessageCircle size={15} />
                      {post.comments.length} {post.comments.length === 1 ? "reply" : "replies"}
                      <ChevronDown size={12} style={{ transform: expandedComments.has(post.id) ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments.has(post.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}
                      >
                        {post.comments.map((c) => (
                          <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                            <Avatar user={c.user} size={30} />
                            <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 12px" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{c.user.name}</div>
                              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{c.text}</div>
                            </div>
                          </div>
                        ))}
                        {user && (
                          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <Avatar user={user} size={30} />
                            <div style={{ flex: 1, display: "flex", gap: 8 }}>
                              <input
                                className="input"
                                placeholder="Write a reply..."
                                value={commentInputs[post.id] || ""}
                                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                                style={{ fontSize: 13, padding: "8px 12px" }}
                              />
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleComment(post.id)}
                                disabled={submittingComment === post.id}
                              >
                                <Send size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMore && (
              <button
                className="btn btn-secondary btn-full"
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchPosts(nextPage);
                }}
              >
                Load More Posts
              </button>
            )}

            {posts.length === 0 && (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  No posts yet. Be the first to share your journey!
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
