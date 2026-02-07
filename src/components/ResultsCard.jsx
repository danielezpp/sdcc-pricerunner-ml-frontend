import React from "react";
import TonePill from "./TonePill";
import { IconDownload, IconSearch, IconServer } from "./icons";

// --- COMPONENTE SKELETON ---
const TableSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <tr key={i}>
        <td><div className="skeleton skeleton-text" style={{ width: 20 }}></div></td>
        <td>
           <div className="skeleton skeleton-text" style={{ width: "60%" }}></div>
           <div className="skeleton skeleton-text" style={{ width: "30%", marginTop: 6 }}></div>
        </td>
        <td><div className="skeleton skeleton-text" style={{ width: "50%" }}></div></td>
        <td>
           <div className="skeleton skeleton-badge"></div>
           <div className="skeleton skeleton-text" style={{ width: "80%", marginTop: 6 }}></div>
        </td>
        <td>
           <div className="skeleton skeleton-text"></div>
           <div className="skeleton skeleton-text"></div>
        </td>
      </tr>
    ))}
  </>
);

// --- COMPONENTE GRAFICO A BARRE ---
const ConfidenceBar = ({ value, color }) => (
  <div className="conf-chart-track">
    <div 
      className="conf-chart-fill" 
      style={{ width: `${Math.min(value * 100, 100)}%`, background: color }} 
    />
  </div>
);

export default function ResultsCard({
  resp, loading, 
  predictions, predictionsView,
  q, setQ, onlyLowConf, setOnlyLowConf,
  sortBy, setSortBy, downloadCsv, confidenceBadge,
  modelInfo 
}) {
  if (!resp && !loading) return null;

  return (
    <section className="card animate-fade-in" style={{ borderTop: "4px solid var(--primary)" }}>
      <div className="card-header" style={{ background: "white" }}>
        <h2 className="card-title">
           <IconServer /> Risultati Analisi
        </h2>
        <button onClick={downloadCsv} disabled={loading || predictionsView?.length === 0} className="btn btn-secondary btn-sm">
          <IconDownload /> Esporta CSV
        </button>
      </div>

      <div className="card-body">
         {/* --- STATISTICHE --- */}
         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12 }}>
               <div className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 700 }}>RECORD ANALIZZATI</div>
               <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
                 {loading ? <div className="skeleton skeleton-text" style={{width: 40}}></div> : resp?.n_records}
               </div>
            </div>
            
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12 }}>
               <div className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 700 }}>MODELLO USATO</div>
               <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--primary)" }}>
                 
                 {loading ? <div className="skeleton skeleton-text" style={{width: 80}}></div> : modelInfo?.type || "-"}
               </div>
            </div>

            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12 }}>
               <div className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 700 }}>ID RIFERIMENTO (RUN/JOB)</div>
               <div className="text-mono" style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
                 {loading ? <div className="skeleton skeleton-text" style={{width: 100}}></div> : modelInfo?.id || "-"}
               </div>
            </div>
         </div>

        {/* --- CONTROLLI --- */}
        <div className="control-bar" style={{ background: "white", padding: 0 }}>
           <div className="search-wrapper" style={{ flex: 1 }}>
              <div className="search-icon"><IconSearch /></div>
              <input 
                className="input-field search-input" 
                placeholder="Filtra risultati..." 
                value={q} 
                onChange={e => setQ(e.target.value)} 
                disabled={loading} 
              />
           </div>
           
           <label className="flex-gap" style={{ fontSize: "0.9rem", cursor: "pointer", userSelect: "none", opacity: loading ? 0.5 : 1 }}>
             <input type="checkbox" checked={onlyLowConf} onChange={e => setOnlyLowConf(e.target.checked)} disabled={loading} />
             Solo bassa confidenza
           </label>

           <div style={{ flex: 1 }} />

           <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field" style={{ width: "auto" }} disabled={loading}>
             <option value="conf_desc">Confidenza Decr.</option>
             <option value="conf_asc">Confidenza Cresc.</option>
             <option value="idx">Ordine Originale</option>
           </select>
        </div>

        {/* --- TABELLA DATI --- */}
        <div className="table-container">
           <table className="data-table">
              <thead>
                 <tr>
                    <th style={{width: 40}}>#</th>
                    <th>Prodotto Input</th>
                    <th>Predizione</th>
                    <th style={{minWidth: 140}}>Confidenza</th>
                    <th>Alternative</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                   <TableSkeleton />
                 ) : predictions.length > 0 ? (
                   predictionsView.map(({ p, idx, conf, gap }, viewIdx) => {
                      const badge = confidenceBadge(conf, gap ?? 0);
                      const barColor = badge.tone === 'good' ? 'var(--success)' : badge.tone === 'bad' ? 'var(--danger)' : 'var(--warning)';

                      return (
                         <tr key={idx}>
                            <td style={{color: "var(--text-muted)"}}>{viewIdx + 1}</td>
                            <td>
                               <div style={{ fontWeight: 500 }}>{p.input?.["Product Title"]}</div>
                               <div className="text-muted" style={{ fontSize: "0.8rem" }}>ID: {p.input?.["Merchant ID"]}</div>
                            </td>
                            <td>
                               <span style={{ fontWeight: 700, color: "var(--primary)" }}>{p.predicted_label}</span>
                            </td>
                            <td>
                               <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <TonePill tone={badge.tone} text={badge.label} />
                                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{(conf * 100).toFixed(1)}%</span>
                                  </div>
                                  <ConfidenceBar value={conf} color={barColor} />
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Gap: {gap?.toFixed(2)}</span>
                               </div>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "0.8rem" }}>
                                {p.topk && p.topk.slice(1).map((x, i) => (
                                  <div key={i} style={{ display: "flex", justifyContent: "space-between", minWidth: "160px", color: "var(--text-secondary)" }}>
                                    <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.label}</span>
                                    <span style={{ fontWeight: 600 }}>{Number(x.prob).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                         </tr>
                      );
                   })
                 ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                        Nessun risultato trovato.
                      </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </section>
  );
}