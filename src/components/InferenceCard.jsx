import React from "react";
import { IconZap, IconSearch, IconCpu } from "./icons";
import FileDropZone from "./FileDropZone";

export default function InferenceCard({
  mode, setMode, title, setTitle, merchantId, setMerchantId,
  topK, setTopK, batchText, setBatchText, batchErrors,
  batchRecordsCount, onBatchFileSelected, setExampleSingle,
  setExampleBatch, resetAll, showAdvanced, setShowAdvanced,
  canSubmit, loading, onSubmit, API_URL,
}) {
  const handleFileDrop = (file) => {
    if (file) {
      onBatchFileSelected({ target: { files: [file] } });
    }
  };

  return (
    <section className="card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title">
          <IconCpu /> Predizione
        </h2>
        <div className="segment-group">
          <button type="button" onClick={() => setMode("single")} className={`segment-btn ${mode === "single" ? "active" : ""}`}>
            Single Entry
          </button>
          <button type="button" onClick={() => setMode("batch")} className={`segment-btn ${mode === "batch" ? "active" : ""}`}>
            Batch Upload
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Toolbar Preset */}
        <div className="control-bar">
          <span className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 700, marginRight: 8 }}>PRESET:</span>
          <div className="btn-group">
            <button type="button" onClick={() => setExampleSingle("iphone")} className="btn btn-secondary btn-sm"><IconZap /> iPhone</button>
            <button type="button" onClick={() => setExampleSingle("camera")} className="btn btn-secondary btn-sm"><IconZap /> Camera</button>
            <button type="button" onClick={() => setExampleSingle("cpu")} className="btn btn-secondary btn-sm"><IconZap /> CPU</button>
            <button type="button" onClick={() => setExampleBatch("")} className="btn btn-secondary btn-sm">Demo Batch</button>
          </div>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={resetAll} className="btn btn-ghost btn-sm">Reset</button>
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="btn btn-ghost btn-sm">
            {showAdvanced ? "Hide Info" : "Info"}
          </button>
        </div>

        <form onSubmit={onSubmit} className="form-grid">
          {mode === "single" ? (
            /* --- MODALITÀ SINGLE --- */
            <>
              <div className="input-group">
                <label className="input-label">Titolo Prodotto</label>
                <div className="search-wrapper" style={{ maxWidth: "100%" }}>
                   <div className="search-icon"><IconSearch /></div>
                   <input
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    className="input-field search-input" 
                    placeholder="Es: Apple iPhone 13 Pro 128GB..." 
                    autoFocus
                    style={{ width: "100%" }}
                   />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Merchant ID</label>
                  <input value={merchantId} onChange={(e) => setMerchantId(e.target.value)} className="input-field" placeholder="Es: 5" />
                </div>
                <div className="input-group">
                  <label className="input-label">Top-K</label>
                  <input type="number" value={topK} onChange={(e) => setTopK(e.target.value)} min={1} max={10} className="input-field" />
                </div>
              </div>
            </>
          ) : (
            /* --- MODALITÀ BATCH --- */
            <div className="input-group">
              <FileDropZone 
                file={null} 
                setFile={handleFileDrop}
                label="Carica CSV per Inferenza"
                accept=".csv,.txt"
              />
              
              <label className="input-label mt-4">Anteprima / Modifica Testo</label>
              <textarea
                rows={6}
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                className="textarea-field text-mono"
              />

              {batchErrors.length > 0 ? (
                <div className="error-banner">
                  <strong>{batchErrors.length} errori trovati:</strong>
                  <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                    {batchErrors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="mt-2" style={{ color: "var(--success-text)", fontWeight: 600 }}>
                  ✓ {batchRecordsCount} record validi.
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button type="submit" disabled={!canSubmit || loading} className="btn btn-primary" style={{ minWidth: "160px" }}>
              {loading ? <div className="spinner" /> : "Avvia Predizione"}
            </button>
          </div>
        </form>

        {/* Advanced Info Block */}
        {showAdvanced && (
          <div className="mt-4" style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)" }}>
            <div className="meta-label">API Endpoint</div>
            <div className="code-block">{API_URL}</div>
          </div>
        )}
      </div>
    </section>
  );
}