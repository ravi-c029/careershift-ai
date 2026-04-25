"use client";

import { useEffect, useRef } from "react";
import { getRiskColor, getRiskLabel } from "@/lib/utils";

interface RiskGaugeProps {
  risk: number;
  size?: number;
}

export function RiskGauge({ risk, size = 200 }: RiskGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h * 0.65;
    const radius = w * 0.38;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const valueAngle = startAngle + ((risk / 100) * Math.PI);

    ctx.clearRect(0, 0, w, h);

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.stroke();

    // Gradient arc
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, "#10b981");
    gradient.addColorStop(0.5, "#f59e0b");
    gradient.addColorStop(1, "#ef4444");

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, valueAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.stroke();

    // Needle
    const needleAngle = startAngle + ((risk / 100) * Math.PI);
    const needleLength = radius * 0.75;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + needleLength * Math.cos(needleAngle),
      cy + needleLength * Math.sin(needleAngle)
    );
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    // Percentage text
    ctx.fillStyle = getRiskColor(risk);
    ctx.font = `bold ${w * 0.12}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`${risk}%`, cx, cy - 30);

    // Label
    ctx.fillStyle = "#94a3b8";
    ctx.font = `${w * 0.065}px Inter, system-ui, sans-serif`;
    ctx.fillText(getRiskLabel(risk), cx, cy - 10);

    // Scale labels
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = `${w * 0.055}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("0%", cx - radius - 8, cy + 14);
    ctx.textAlign = "right";
    ctx.fillText("100%", cx + radius + 8, cy + 14);
  }, [risk, size]);

  return (
    <div className="risk-gauge-container">
      <canvas
        ref={canvasRef}
        width={size}
        height={size * 0.65}
        style={{ maxWidth: "100%" }}
      />
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 8,
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        <span style={{ color: "#10b981" }}>● Low</span>
        <span style={{ color: "#f59e0b" }}>● Moderate</span>
        <span style={{ color: "#ef4444" }}>● High</span>
      </div>
    </div>
  );
}
