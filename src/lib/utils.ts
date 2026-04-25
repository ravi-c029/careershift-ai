import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getRiskColor(risk: number): string {
  if (risk >= 70) return "#ef4444";
  if (risk >= 40) return "#f59e0b";
  return "#10b981";
}

export function getRiskLabel(risk: number): string {
  if (risk >= 70) return "High Risk";
  if (risk >= 40) return "Moderate Risk";
  return "Low Risk";
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}
