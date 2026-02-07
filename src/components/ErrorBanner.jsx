import React from "react";

export default function ErrorBanner({ err }) {
  if (!err) return null;

  return (
    <section className="error-banner">
      <h3 style={{ margin: "0 0 8px" }}>Errore Pipeline ML</h3>
      <div>
        <b>Status:</b> {err.status || "N/A"} — {err.message}
      </div>
      {err.details && (
        <pre style={{ marginTop: "12px", fontSize: "0.8rem" }}>
          {JSON.stringify(err.details, null, 2)}
        </pre>
      )}
    </section>
  );
}
