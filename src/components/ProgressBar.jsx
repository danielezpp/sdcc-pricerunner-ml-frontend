import React from "react";

export default function ProgressBar({ status }) {
  const getProgressInfo = (s) => {
    const state = String(s).toLowerCase();
    if (["idle"].includes(state)) return { pct: 0, label: "Pronto" };
    if (["creating", "requesting"].includes(state)) return { pct: 20, label: "Inizializzazione..." };
    if (["uploading"].includes(state)) return { pct: 45, label: "Caricamento Dataset..." };
    if (["polling", "processing"].includes(state)) return { pct: 80, label: "Elaborazione in corso..." };
    if (["succeeded", "done"].includes(state)) return { pct: 100, label: "Completato" };
    if (["failed"].includes(state)) return { pct: 100, label: "Fallito" };
    return { pct: 5, label: "..." };
  };

  const { pct, label } = getProgressInfo(status);
  const isError = String(status).toLowerCase().includes("failed");
  const isDone = ["succeeded", "done"].includes(String(status).toLowerCase());
  const isActive = pct > 0 && pct < 100;

  if (status === "idle") return null;

  return (
    <div className="progress-wrapper animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 6 }}>
        <span className="progress-label">{label}</span>
        <span className="progress-pct">{pct}%</span>
      </div>
      
      <div className="progress-track">
        <div 
          className={`progress-fill ${isActive ? "striped-animate" : ""}`}
          style={{ 
            width: `${pct}%`,
            background: isError 
              ? "var(--danger)" 
              : isDone 
                ? "var(--success)" 
                : "var(--primary)" 
          }} 
        />
      </div>
    </div>
  );
}