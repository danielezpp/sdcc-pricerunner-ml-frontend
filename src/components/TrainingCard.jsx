import React from "react";
import { IconDatabase } from "./icons"; 
import FileDropZone from "./FileDropZone";
import ProgressBar from "./ProgressBar";

export default function TrainingCard({
  trainAlgo, setTrainAlgo, trainLabel, setTrainLabel,
  trainCsv, setTrainCsv, trainJobStatus, startTrainingJob,
  trainJob, trainStatusObj, trainErr, 
  setTrainJob, setTrainStatusObj, setTrainErr, setTrainJobStatus,
  autoSwitch, setAutoSwitch 
}) {
  const trainedModelKey = trainStatusObj?.artifacts?.model_key;

  return (
    <section className="card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title"><IconDatabase /> Training Modello</h2>
      </div>

      <div className="card-body">
        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Algoritmo</label>
            <select className="input-field" value={trainAlgo} onChange={(e) => setTrainAlgo(e.target.value)}>
              <option value="logreg">Logistic Regression</option>
              <option value="random_forest">Random Forest</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Nome Job (Opzionale)</label>
            <input className="input-field" placeholder="Es: dataset-v2" value={trainLabel} onChange={(e) => setTrainLabel(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
           <FileDropZone 
             file={trainCsv}
             setFile={(f) => {
               setTrainCsv(f);
               setTrainJob(null); setTrainStatusObj(null); setTrainErr(null); setTrainJobStatus("idle");
             }}
             label="Carica Dataset di Training (CSV)"
             accept=".csv"
           />
        </div>

        <ProgressBar status={trainJobStatus} />

        <div className="mt-4 flex-gap" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Checkbox Auto-Switch */}
          <label className="flex-gap" style={{ cursor: "pointer", userSelect: "none" }}>
            <input 
              type="checkbox" 
              checked={autoSwitch} 
              onChange={(e) => setAutoSwitch(e.target.checked)} 
              disabled={["creating", "uploading", "polling"].includes(trainJobStatus)}
            />
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Usa automaticamente se successo
            </span>
          </label>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!trainCsv || ["creating", "uploading", "polling"].includes(trainJobStatus)}
            onClick={startTrainingJob}
            style={{ minWidth: 160 }}
          >
            {["creating", "uploading", "polling"].includes(trainJobStatus) ? "Training..." : "Avvia Training"}
          </button>
        </div>

        {trainStatusObj && (
          <div className="mt-4 animate-fade-in" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: 16 }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.9rem" }}>Stage: <b>{trainStatusObj.stage}</b></span>
                <span className={`status-badge ${trainStatusObj.state === 'SUCCEEDED' ? 'success' : trainStatusObj.state === 'FAILED' ? 'error' : ''}`}>
                  {trainStatusObj.state}
                </span>
             </div>
             {trainedModelKey && (
               <div className="text-mono" style={{ fontSize: "0.8rem", color: "var(--primary)" }}>
                 Key Generata: {trainedModelKey}
               </div>
             )}
          </div>
        )}

        {trainErr && <div className="error-banner" style={{ marginTop: 20 }}>{trainErr.message}</div>}
      </div>
    </section>
  );
}