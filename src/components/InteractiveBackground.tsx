"use client";

import { useEffect, useRef } from "react";

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const COLORS = ["#8b5cf6", "#06b6d4", "#a78bfa", "#22d3ee"];
    const MAX_DIST = 150;
    const MOUSE_R = 200;
    let particles: { x: number; y: number; vx: number; vy: number; r: number; color: string }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      const N = window.innerWidth < 768 ? 55 : 110;
      particles = Array.from({ length: N }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const hex2rgb = (h: string) =>
      [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)].join(",");

    let clickPulse = { x: -999, y: -999, radius: 0, active: false };
    let scrollY = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const m = mouseRef.current;
      const t = Date.now() * 0.00045;

      // Draw click pulse
      if (clickPulse.active) {
        ctx.beginPath();
        ctx.arc(clickPulse.x, clickPulse.y, clickPulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 92, 246, ${Math.max(0, 1 - clickPulse.radius / 400)})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        clickPulse.radius += 12;
        if (clickPulse.radius > 400) clickPulse.active = false;
      }

      particles.forEach((p) => {
        // Friction to return to normal speed after click blast
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 1) {
          p.vx *= 0.92;
          p.vy *= 0.92;
        } else if (speed < 0.2) {
           p.vx += (Math.random() - 0.5) * 0.2;
           p.vy += (Math.random() - 0.5) * 0.2;
        }

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        // Mouse repel
        const dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy);
        if (d < MOUSE_R) { const f = (MOUSE_R - d) / MOUSE_R * 0.02; p.x -= dx * f; p.y -= dy * f; }
      });

      // particle–particle lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < MAX_DIST) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / MAX_DIST) * 0.28})`; ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }

      // mouse–particle lines
      particles.forEach((p) => {
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        if (d < MOUSE_R) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(${hex2rgb(p.color)},${(1 - d / MOUSE_R) * 0.65})`; ctx.lineWidth = 0.9; ctx.stroke();
        }
      });

      // draw particles + glow near mouse
      particles.forEach((p) => {
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        if (d < MOUSE_R * 0.55) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
          g.addColorStop(0, `rgba(${hex2rgb(p.color)},0.45)`); g.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hex2rgb(p.color)},0.7)`; ctx.fill();
      });

      // ── Floating geometric shapes with scroll parallax ──────────────────────────────
      const parallax = scrollY * 0.3;

      // Hexagon top-left
      const hx = canvas.width * 0.07, hy = canvas.height * 0.18 - parallax * 0.8, hr = 55 + Math.sin(t) * 7;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i + t * 0.25; const x = hx + hr * Math.cos(a), y = hy + hr * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.closePath(); ctx.strokeStyle = "rgba(139,92,246,0.2)"; ctx.lineWidth = 1.5; ctx.stroke();

      // Inner hexagon
      const hr2 = 30 + Math.sin(t * 1.3 + 1) * 4;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - t * 0.4; const x = hx + hr2 * Math.cos(a), y = hy + hr2 * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.closePath(); ctx.strokeStyle = "rgba(167,139,250,0.12)"; ctx.lineWidth = 1; ctx.stroke();

      // Triangle top-right
      const tx = canvas.width * 0.91, ty = canvas.height * 0.14 - parallax * 1.2, tr = 48 + Math.cos(t * 0.8) * 6;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) { const a = (Math.PI * 2 / 3) * i - Math.PI / 2 + t * 0.35; ctx.lineTo(tx + tr * Math.cos(a), ty + tr * Math.sin(a)); }
      ctx.closePath(); ctx.strokeStyle = "rgba(6,182,212,0.22)"; ctx.lineWidth = 1.4; ctx.stroke();

      // Diamond bottom-left
      const dxl = canvas.width * 0.04, dyl = canvas.height * 0.78 - parallax * 0.5, dr = 38 + Math.sin(t * 0.9 + 2) * 5;
      ctx.beginPath(); ctx.moveTo(dxl, dyl - dr); ctx.lineTo(dxl + dr * 0.65, dyl); ctx.lineTo(dxl, dyl + dr); ctx.lineTo(dxl - dr * 0.65, dyl);
      ctx.closePath(); ctx.strokeStyle = "rgba(167,139,250,0.18)"; ctx.lineWidth = 1.2; ctx.stroke();

      // Concentric rings bottom-right
      const rx = canvas.width * 0.88, ry = canvas.height * 0.80 - parallax * 0.9;
      [70, 110, 150].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(rx, ry, r + Math.sin(t * 0.9 + i) * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139,92,246,${0.07 - i * 0.018})`; ctx.lineWidth = 1; ctx.stroke();
      });

      // Grid lines (very subtle)
      const gSpacing = 80;
      for (let x = 0; x < canvas.width; x += gSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = "rgba(139,92,246,0.025)"; ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = "rgba(6,182,212,0.02)"; ctx.lineWidth = 0.5; ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    const onClick = (e: MouseEvent) => {
      clickPulse = { x: e.clientX, y: e.clientY, radius: 0, active: true };
      // Push particles away
      particles.forEach((p) => {
        const dx = p.x - e.clientX, dy = p.y - e.clientY;
        const dist = Math.hypot(dx, dy);
        if (dist < 250) {
          const force = (250 - dist) / 250;
          p.vx += (dx / dist) * force * 15;
          p.vy += (dy / dist) * force * 15;
        }
      });
    };
    const onScroll = () => { scrollY = window.scrollY; };

    resize(); init(); draw();
    window.addEventListener("resize", () => { resize(); init(); });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}
