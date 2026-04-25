"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: "high" | "medium" | "low";
}

interface SkillRadarProps {
  skillGaps: SkillGap[];
}

export function SkillRadar({ skillGaps }: SkillRadarProps) {
  const data = skillGaps.slice(0, 7).map((sg) => ({
    subject: sg.skill,
    Current: sg.currentLevel,
    Required: sg.requiredLevel,
  }));

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid
            gridType="polygon"
            stroke="rgba(255,255,255,0.08)"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "#111128",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Radar
            name="Required"
            dataKey="Required"
            stroke="#8b5cf6"
            fill="rgba(139,92,246,0.2)"
            strokeWidth={2}
          />
          <Radar
            name="Current"
            dataKey="Current"
            stroke="#06b6d4"
            fill="rgba(6,182,212,0.15)"
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          marginTop: 8,
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        <span style={{ color: "#8b5cf6" }}>● Required Level</span>
        <span style={{ color: "#06b6d4" }}>● Current Level</span>
      </div>
    </div>
  );
}
