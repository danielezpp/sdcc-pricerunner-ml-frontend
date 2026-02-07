import React from "react";
import { IconServer, IconDownload, IconCheck, IconFile, IconAlert, IconZap } from "./icons"; 
import FileDropZone from "./FileDropZone";
import ProgressBar from "./ProgressBar";

export default function BatchAsyncCard({
  batchFile, setBatchFile,
  job, jobStatus, jobResult,
  startAsyncBatchInferenceUpload,
  loadBatchPreviewFromCsv,
  previewLoading, showPreview, setShowPreview,
  previewLimit, setPreviewLimit,
  previewErr, previewRows,
  summaryView,
  setJob, setJobResult, setJobStatus,
}) {
  
  // Calcolo per il grafico a barre
  const maxCount = summaryView?.labels?.length > 0 
    ? Math.max(...summaryView.labels.map(l => l.count)) 
    : 1;

  return (
    <section className="card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title">
          <IconServer /> Inference Asincrona (S3)
        </h2>
      </div>

      <div className="card-body">
        {/* AREA CARICAMENTO FILE */}
        <FileDropZone 
           file={batchFile}
           setFile={(f) => { 
             setBatchFile(f); 
             setJob(null); 
             setJobResult(null); 
             setJobStatus("idle"); 
           }}
           label="Carica CSV Large Dataset"
           accept=".csv"
        />

        {/* PROGRESS BAR */}
        <ProgressBar status={jobStatus} />

        {/* INFO JOB */}
        {job?.input_key && jobStatus !== "done" && (
           <div className="mt-2 text-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "right" }}>
             Key: {job.input_key}
           </div>
        )}

        {/* BOTTONI AZIONE */}
        <div className="mt-4 flex-gap" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!batchFile || ["requesting", "uploading", "processing"].includes(jobStatus)}
            onClick={startAsyncBatchInferenceUpload}
            style={{ minWidth: 160 }}
          >
             {["requesting", "uploading", "processing"].includes(jobStatus) 
               ? "Elaborazione..." 
               : "Avvia Batch Asincrono"}
          </button>
        </div>

        {/* RISULTATI */}
        {jobStatus === "done" && jobResult && (
          <div className="mt-4 animate-fade-in" style={{ background: "var(--bg-panel)", padding: 24, borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
            
            {/* Header Risultati */}
            <div className="flex-gap" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: 16, marginBottom: 16 }}>
              <strong style={{ color: "var(--success-text)", fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <IconCheck /> Analisi Completata
              </strong>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                 {jobResult?.downloads?.csv && (
                   <a href={jobResult.downloads.csv} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                     <IconDownload /> CSV
                   </a>
                 )}
                 {jobResult?.downloads?.json && (
                   <a href={jobResult.downloads.json} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                     <IconDownload /> JSON
                   </a>
                 )}
                 {jobResult?.downloads?.summary && (
                   <a href={jobResult.downloads.summary} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                     Summary
                   </a>
                 )}
              </div>
            </div>

            {/* DASHBOARD SOMMARIO */}
            {summaryView && (
              <div className="summary-dashboard">
                {/* 1. KPI CARDS */}
                <div className="kpi-container">
                  <div className="kpi-card records">
                    <div className="kpi-icon"><IconFile /></div>
                    <div className="kpi-content">
                      <span className="kpi-label">Totale Record</span>
                      <span className="kpi-value">{summaryView.n_records}</span>
                    </div>
                  </div>
                  
                  <div className={`kpi-card ${summaryView.low_confidence_count > 0 ? 'alert' : 'success'}`}>
                    <div className="kpi-icon"><IconAlert /></div>
                    <div className="kpi-content">
                      <span className="kpi-label">Bassa Confidenza</span>
                      <span className="kpi-value">{summaryView.low_confidence_count}</span>
                    </div>
                  </div>

                  <div className="kpi-card success">
                    <div className="kpi-icon"><IconZap /></div>
                    <div className="kpi-content">
                      <span className="kpi-label">Media Confidenza</span>
                      <span className="kpi-value">{(summaryView.avg_confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* 2. GRAFICO DISTRIBUZIONE */}
                <div className="chart-container">
                  <div className="chart-title">Distribuzione Predizioni (Top 10)</div>
                  <div className="chart-scroll">
                    {summaryView.labels.slice(0, 10).map((item, i) => (
                      <div className="chart-row" key={i}>
                        <div className="chart-label" title={item.label}>{item.label}</div>
                        <div className="chart-bar-bg">
                          <div 
                            className="chart-bar-fill" 
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <div className="chart-value">{item.count}</div>
                      </div>
                    ))}
                    {summaryView.labels.length === 0 && (
                      <div className="text-muted" style={{fontSize: "0.8rem", textAlign: "center", padding: 20}}>Nessun dato disponibile</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ANTEPRIMA DATI TABELLA */}
            <div className="flex-gap mt-4" style={{ alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border-light)" }}>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={loadBatchPreviewFromCsv} 
                disabled={previewLoading || !jobResult?.downloads?.csv}
              >
                {previewLoading ? "Caricamento..." : (showPreview ? "Aggiorna Anteprima" : "👁 Visualizza Anteprima Dati")}
              </button>
              
              {showPreview && (
                <>
                   <label className="flex-gap" style={{ fontSize: "0.85rem", marginLeft: 8 }}>
                    Righe:
                    <input
                      type="number" min={10} max={200}
                      className="input-field" style={{ width: 70, padding: "4px 8px", height: "auto" }}
                      value={previewLimit} onChange={(e) => setPreviewLimit(Number(e.target.value) || 10)}
                    />
                  </label>
                  <button className="btn btn-ghost btn-sm" style={{marginLeft: "auto"}} onClick={() => setShowPreview(false)}>
                    Nascondi
                  </button>
                </>
              )}
            </div>

            {previewErr && <div className="error-banner" style={{ marginTop: 12 }}>{previewErr}</div>}

            {showPreview && previewRows?.length > 0 && (
              <div className="table-container mt-3">
                <table className="data-table">
                  <thead>
                    <tr>
                      {["Title","ID","Pred Label","Conf","Gap","Top2"].map(k => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, previewLimit).map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ maxWidth: 300, whiteSpace: "normal" }}>{row.product_title}</td>
                        <td>{row.merchant_id}</td>
                        <td><span style={{ fontWeight: 600, color: "var(--primary)" }}>{row.predicted_label}</span></td>
                        <td>{row.confidence ? Number(row.confidence).toFixed(3) : ""}</td>
                        <td>{row.gap_1_2 ? Number(row.gap_1_2).toFixed(3) : ""}</td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                           {row.top2_label} ({row.top2_prob ? Number(row.top2_prob).toFixed(2) : ""})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}