import React from "react";

export default function TonePill({ tone, text }) {
  const style = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    border: "1px solid transparent",
  };

  const toneStyle =
    tone === "good"
      ? { background: "var(--success-bg)", color: "var(--success-text)", borderColor: "#bbf7d0" }
      : tone === "warn"
      ? { background: "var(--warning-bg)", color: "var(--warning-text)", borderColor: "#fde68a" }
      : tone === "bad"
      ? { background: "var(--danger-bg)", color: "var(--danger-text)", borderColor: "#fecaca" }
      : { background: "#f1f5f9", color: "#64748b", borderColor: "#e2e8f0" };

  return <span style={{ ...style, ...toneStyle }}>{text}</span>;
}
