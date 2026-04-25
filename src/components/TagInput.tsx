"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  maxTags = 20,
}: TagInputProps) {
  const [inputVal, setInputVal] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= maxTags) return;
    onChange([...value, trimmed]);
    setInputVal("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === "Backspace" && !inputVal && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div
      className="tag-input-container"
      onClick={() => document.getElementById("tag-input")?.focus()}
    >
      {value.map((tag, i) => (
        <span key={i} className="tag">
          {tag}
          <button
            className="tag-remove"
            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            type="button"
            aria-label={`Remove ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id="tag-input"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputVal && addTag(inputVal)}
        placeholder={value.length === 0 ? placeholder : ""}
        style={{
          flex: 1,
          minWidth: 120,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--text-primary)",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
        }}
      />
    </div>
  );
}
