import { useMemo, useState, useRef } from "react";
import "./App.css";
// API Imports
import { runInference } from "./api/inferenceApi";
import { createTrainingJob } from "./api/trainingApi";
import { getBatchPresigned } from "./api/batchAsyncApi";
import { uploadPresignedPost } from "./utils/presignedUpload";
import { pollJsonUrl } from "./utils/polling";
import { parseCsvToObjects } from "./utils/csv";
import { parseBatch, clampInt, confidenceBadge } from "./utils/inferenceHelpers";

// Components Imports
import InferenceCard from "./components/InferenceCard";
import TrainingCard from "./components/TrainingCard";
import BatchAsyncCard from "./components/BatchAsyncCard";
import ResultsCard from "./components/ResultsCard";
import ErrorBanner from "./components/ErrorBanner";
import ToastProvider from "./components/ToastProvider"; 
import { useToast } from "./components/ToastContext";

// NEW COMPONENTS & HOOKS
import ActiveModelBadge from "./components/ActiveModelBadge";

import { usePersistedState } from "./utils/usePersistedState"; 
import { useSessionState } from "./utils/useSessionState"; 

const API_URL = import.meta.env.VITE_API_URL;
const UPLOAD_URL_API = import.meta.env.VITE_UPLOAD_URL_API;
const TRAINING_JOBS_API = import.meta.env.VITE_TRAINING_JOBS_API;

function AppContent() {
  const toast = useToast(); 
  const resultsRef = useRef(null);
  const topRef = useRef(null);

  // --- STATI DI SESSIONE
  // Gestisce il modello attivo corrente
  const [selectedModelKey, setSelectedModelKey] = useSessionState("pricerunner_session_model_key", "");
  // Gestisce i dettagli dell'ultimo modello custom creato (ID + Key)
  const [customModelDetails, setCustomModelDetails] = useSessionState("pricerunner_session_model_details", null);

  // --- STATI PERSISTENTI
  const [trainAlgo, setTrainAlgo] = usePersistedState("pricerunner_algo", "logreg");
  const [autoSwitch, setAutoSwitch] = usePersistedState("pricerunner_autoswitch", true);
  const [merchantId, setMerchantId] = usePersistedState("pricerunner_merchant", "5");

  // --- STATI NORMALI  ---
  const [mode, setMode] = useState("single");
  const [title, setTitle] = useState("apple iphone 8 plus gold 5.5 64gb 4g unlocked sim free");
  
  const [batchText, setBatchText] = useState(
    [
      "apple iphone 8 plus gold 5.5 64gb 4g unlocked sim free|5",
      "sony dscrx100m4 advanced digital compact premium 4k camera evf 4k movie|3",
    ].join("\n")
  );
  
  const [trainLabel, setTrainLabel] = useState("");
  const [trainCsv, setTrainCsv] = useState(null);
  const [trainJob, setTrainJob] = useState(null);
  const [trainJobStatus, setTrainJobStatus] = useState("idle");
  const [trainStatusObj, setTrainStatusObj] = useState(null);
  const [trainErr, setTrainErr] = useState(null);
  const [topK, setTopK] = useState(3);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [err, setErr] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchFile, setBatchFile] = useState(null);
  const [job, setJob] = useState(null);
  const [jobStatus, setJobStatus] = useState("idle");
  const [jobResult, setJobResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErr, setPreviewErr] = useState(null);
  const [previewRows, setPreviewRows] = useState([]); 
  const [previewLimit, setPreviewLimit] = useState(10);
  const [q, setQ] = useState("");
  const [onlyLowConf, setOnlyLowConf] = useState(false);
  const [sortBy, setSortBy] = useState("conf_desc");

  // --- SNAPSHOT PER RESULTS ---
  const [resultInfo, setResultInfo] = useState(null);

  // --- LOGICA TOGGLE MODELLO ---
  const toggleModel = () => {
    if (selectedModelKey) {
      // Se siamo su Custom -> Passa a Default
      setSelectedModelKey("");
      toast.info("Default Attivo", "Ripristinato il modello di sistema.");
    } else {
      // Se siamo su Default -> Passa a Custom (se esiste)
      if (customModelDetails?.key) {
        setSelectedModelKey(customModelDetails.key);
        toast.success("Custom Attivo", "Attivato il modello utente.");
      } else {
        toast.warning("Nessun Modello", "Non hai ancora addestrato nessun modello custom in questa sessione.");
      }
    }
  };

  // Memos...
  const { records: batchRecords, errors: batchErrors } = useMemo(() => parseBatch(batchText), [batchText]);
  const summaryObj = useMemo(() => {
    const s = jobResult?.summary;
    if (!s) return null;
    try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return { raw: s }; }
  }, [jobResult?.summary]);

  const summaryView = useMemo(() => {
    const s = summaryObj;
    if (!s || typeof s !== "object") return null;
    const labels = s.labels_distribution ? Object.entries(s.labels_distribution).map(([label, count]) => ({ label, count: Number(count) || 0 })) : [];
    labels.sort((a, b) => b.count - a.count);
    return {
      ok: Boolean(s.ok), source_file: s.source_file || "", n_records: Number(s.n_records) || 0,
      model_key: s.model_key || "", source: s.source || "", latest_run_id: s.latest_run_id || "",
      latest_timestamp_utc: s.latest_timestamp_utc || "", low_confidence_count: Number(s.low_confidence_count) || 0,
      avg_confidence: typeof s.avg_confidence === "number" ? s.avg_confidence : null,
      labels, output_keys: s.output_keys || null,
    };
  }, [summaryObj]);

  const canSubmit = useMemo(() => {
    if (mode === "single") return title.trim().length > 0;
    return batchRecords.length > 0 && batchErrors.length === 0;
  }, [mode, title, batchRecords.length, batchErrors.length]);

  // Actions...
  function setExampleSingle(kind) {
    setErr(null); setResp(null); setResultInfo(null);
    if (kind === "iphone") { setMode("single"); setTitle("apple iphone 8 plus gold 5.5 64gb 4g unlocked sim free"); setMerchantId("5"); }
    else if (kind === "camera") { setMode("single"); setTitle("sony dscrx100m4 advanced digital compact premium 4k camera evf 4k movie"); setMerchantId("3"); }
    else if (kind === "cpu") { setMode("single"); setTitle("intel core i7 12700k processor 12th gen"); setMerchantId("1"); }
    toast.info("Preset Caricato", `Esempio ${kind} impostato.`);
  }
  function setExampleBatch() { setErr(null); setResp(null); setResultInfo(null); setMode("batch"); setBatchText(["apple iphone 8 plus gold 5.5 64gb 4g unlocked sim free|5","sony dscrx100m4 advanced digital compact premium 4k camera evf 4k movie|3"].join("\n")); toast.info("Preset Batch", "Esempio batch caricato."); }
  
  async function onBatchFileSelected(e) { 
    const file = e.target.files?.[0]; if (!file) return;
    setErr(null); setResp(null); setResultInfo(null); setMode("batch");
    const text = await file.text();
    if (!text.includes(",") || !/Product\s*Title/i.test(text.split(/\r?\n/)[0] || "")) { setBatchText(text.trim()); return; }
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const header = lines[0].split(",").map(x => x.trim().replace(/^"|"$/g, ""));
    const idxTitle = header.findIndex(h => h.toLowerCase() === "product title");
    const idxMerchant = header.findIndex(h => h.toLowerCase() === "merchant id");
    if (idxTitle === -1) { setErr({ status: 0, message: "CSV non valido" }); toast.error("Errore File", "Manca 'Product Title'"); return; }
    const out = [];
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(",").map(x=>x.trim().replace(/"/g,""));
        const t = cells[idxTitle]; const m = idxMerchant >= 0 ? cells[idxMerchant] : "0";
        if(t) out.push(`${t}|${m}`);
    }
    setBatchText(out.join("\n")); toast.success("File Caricato", `${out.length} righe.`);
  }
  function resetAll() { setErr(null); setResp(null); setResultInfo(null); setMode("single"); setTitle(""); setMerchantId(""); setTopK(3); toast.info("Reset", "Campi puliti."); }

  // --- INFERENZA SUBMIT ---
  async function onSubmit(e) {
    e.preventDefault();
        
    setErr(null); 
    setResp(null); 
    setResultInfo(null); 
    setLoading(true);
    
    // CATTURA LO STATO AL MOMENTO DEL CLICK (Snapshot)
    const usedKey = selectedModelKey;
    
    const k = clampInt(topK, 1, 10, 3);
    const records = mode === "single" ? [{ "Product Title": title.trim(), "Merchant ID": merchantId.trim() || "0" }] : batchRecords;
    const payload = { top_k: k, records };
    if (usedKey) payload.model_key = usedKey;

    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    try {
      const { ok, status, data, rawText } = await runInference(API_URL, payload);
      
      if (!ok || data?.ok === false) {
        // --- AUTO-RECOVERY ---
        const isModelError = status === 409 || status === 404 || (data?.error?.code === "model_not_ready") || (rawText && rawText.includes("NoSuchKey"));
        
        if (isModelError && usedKey) {
           toast.error("Modello Non Trovato", "Il modello custom non è più disponibile. Torno al default.");
           setSelectedModelKey("");
           setErr({ status, message: "Modello custom scaduto o non trovato.", details: "Il sistema è tornato automaticamente al modello di Default." });
           return;
        }

        const msg = data?.error?.message || `HTTP ${status}`;
        setErr({ status, message: msg, details: data?.error?.details || rawText });
        toast.error("Errore Inferenza", msg);
        return;
      }
      
      // --- CALCOLO METADATI (Snapshot) ---
      const isCustom = Boolean(usedKey);
      let displayId = "-";
      let modelType = isCustom ? 'Utente (Custom)' : 'Default (System)';

      if (isCustom) {
         if (usedKey === customModelDetails?.key && customModelDetails?.id) {
            displayId = customModelDetails.id;
         } 
         else if (data?.run_id) {
            displayId = data.run_id;
         } 
         else {
            displayId = "..." + usedKey.slice(-12);
         }
      } else {
         displayId = data?.default_run_id || data?.run_id || "-";
      }

      // Aggiornamento dei risultati
      setResultInfo({ type: modelType, id: displayId });
      setResp(data);

      toast.success("Analisi Completata", `Analizzati ${data.n_records} record.`);
    } catch (ex) {
      setErr({ status: 0, message: ex?.message || "Errore rete" });
      toast.error("Errore Rete", ex.message);
    } finally { setLoading(false); }
  }

  function downloadCsv() {
    if (!predictionsView || predictionsView.length === 0) return;
    const header = [
      "product_title", "merchant_id", "predicted_label", "confidence", "gap_1_2",
      "top2_label", "top2_prob", "top3_label", "top3_prob",
    ];
    const rows = predictionsView.map(({ p, conf, gap }) => {
      const title = (p.input?.["Product Title"] ?? "").toString();
      const merchant = (p.input?.["Merchant ID"] ?? "").toString();
      const label = (p.predicted_label ?? "").toString();
      const topk = Array.isArray(p.topk) ? p.topk : [];
      const t2 = topk[1] || {};
      const t3 = topk[2] || {};
      const values = [
        title, merchant, label,
        typeof conf === "number" ? conf : "",
        typeof gap === "number" ? gap : "",
        (t2.label ?? "").toString(), typeof t2.prob === "number" ? t2.prob : "",
        (t3.label ?? "").toString(), typeof t3.prob === "number" ? t3.prob : "",
      ];
      return values.map((v) => {
          const s = String(v);
          if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        }).join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `pricerunner_predictions_${ts}.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  
  // --- TRAINING LOGIC ---
  async function startTrainingJob() {
    if (!TRAINING_JOBS_API || !trainCsv) { toast.error("Config Error", "Manca CSV o API"); return; }
    setTrainErr(null); setTrainJob(null); setTrainStatusObj(null); setTrainJobStatus("creating");
    try {
      const { ok, status, data, rawText } = await createTrainingJob(TRAINING_JOBS_API,{algo:"random_forest"});
      if (!ok || !data?.ok) { setTrainJobStatus("failed"); setTrainErr({ message: "Create job fallito", details: rawText }); toast.error("Errore", "Impossibile creare job."); return; }
      setTrainJob(data); setTrainJobStatus("uploading");
      await uploadPresignedPost(data.upload.dataset, trainCsv);
      if (data.upload.manifest?.url) await uploadPresignedPost(data.upload.manifest, new Blob([JSON.stringify({})],{type:"application/json"}), "manifest.json");
      setTrainJobStatus("polling"); toast.info("Training Avviato", "Attendere...");

      const st = await pollJsonUrl(data.polling.status.url, { delayMs: 2000, maxAttempts: 180, accept404: true, isDone: (x) => String(x?.state).toUpperCase() === "FAILED" || (String(x?.state).toUpperCase() === "SUCCEEDED" && String(x?.stage).toUpperCase() === "DONE") });
      setTrainStatusObj(st);

      if (String(st?.state).toUpperCase() === "SUCCEEDED") {
        setTrainJobStatus("succeeded");
        const newModelKey = st.artifacts?.model_key;
        
        if (newModelKey) {
            const details = { 
                key: newModelKey, 
                id: data.job_id, 
                date: new Date().toISOString(),
                algo: trainAlgo
            };
            
            setCustomModelDetails(details);

            if (autoSwitch) {
                setSelectedModelKey(newModelKey);
                toast.success("Nuovo Modello Attivo!", "Attivato automaticamente.");
                setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 500);
            } else {
                toast.success("Training Completato", "Puoi attivare il modello dal badge in alto.");
            }
        }
      } else {
        setTrainJobStatus("failed"); setTrainErr({ message: "Training fallito", details: st?.error || st }); toast.error("Training Fallito", "Vedi dettagli.");
      }
    } catch (ex) { setTrainJobStatus("failed"); setTrainErr({ message: ex.message }); toast.error("Errore Rete", ex.message); }
  }
  
  async function startAsyncBatchInferenceUpload() {
      if (!UPLOAD_URL_API || !batchFile) return;
      setErr(null); setResp(null); setJobResult(null); setJobStatus("requesting");
      try {
        const { ok, status, data, rawText } = await getBatchPresigned(UPLOAD_URL_API, batchFile.name);
        if (!ok || !data) { setJobStatus("failed"); setErr({ status, message: "Errore presigned", details: rawText }); return; }
        if (!data?.post?.url) { setJobStatus("failed"); setErr({ status, message: "Risposta non valida", details: JSON.stringify(data) }); return; }
        setJob(data); setJobStatus("uploading"); await uploadPresignedPost(data.post, batchFile);
        setJobStatus("processing"); toast.info("Upload OK", "Elaborazione asincrona avviata...");
        if (!data.download_urls?.summary) { setJobStatus("done"); setJobResult({ ok: true }); return; }
        const sum = await pollJsonUrl(data.download_urls.summary, { delayMs: 2000, maxAttempts: 60, accept404: true, isDone: () => true });
        setJobResult({ summary: sum, downloads: data.download_urls, expected: data.expected_output_keys, input_key: data.input_key });
        setJobStatus("done"); toast.success("Batch Completato", "Risultati pronti.");
      } catch (ex) { setJobStatus("failed"); setErr({ message: ex.message }); toast.error("Errore Batch", ex.message); }
  }

  async function loadBatchPreviewFromCsv() {
    setPreviewErr(null); setPreviewLoading(true);
    try {
      const r = await fetch(jobResult?.downloads?.csv, { method: "GET" });
      if (!r.ok) throw new Error("Errore fetch");
      setPreviewRows(parseCsvToObjects(await r.text())); setShowPreview(true);
    } catch (e) { setPreviewErr(e.message); } finally { setPreviewLoading(false); }
  }

  const predictions = resp?.predictions || [];
  const predictionsView = useMemo(() => {
    const items = predictions.map((p, idx) => ({ p, idx, conf: p.confidence, gap: p.topk?.[0]?.prob - p.topk?.[1]?.prob }));
    let filtered = items;
    if (q) filtered = filtered.filter(({ p }) => (p.input?.["Product Title"]||"").toLowerCase().includes(q.toLowerCase()));
    if (onlyLowConf) filtered = filtered.filter(({ conf }) => typeof conf === "number" && conf < 0.45);
    const sorted = [...filtered];
    if (sortBy === "conf_desc") sorted.sort((a, b) => (b.conf ?? -1) - (a.conf ?? -1));
    else if (sortBy === "conf_asc") sorted.sort((a, b) => (a.conf ?? 2) - (b.conf ?? 2));
    else sorted.sort((a, b) => a.idx - b.idx);
    return sorted;
  }, [predictions, q, onlyLowConf, sortBy]);

  return (
    <div className="layout">
      
      {/* 1. BADGE FLOTTANTE CON TOGGLE */}
      <ActiveModelBadge 
        selectedModelKey={selectedModelKey} 
        hasCustomModel={Boolean(customModelDetails?.key)}
        customModelDetails={customModelDetails}
        onToggle={toggleModel} 
      />

      <header className="header-hero animate-fade-in" ref={topRef}>
        <h1 className="app-title">PriceRunner Pipeline</h1>
        <p className="app-subtitle">Sistema di classificazione distribuita basato su AWS Lambda.</p>
      </header>
      
      <ErrorBanner err={err} />

      <InferenceCard
        mode={mode} setMode={setMode}
        title={title} setTitle={setTitle}
        merchantId={merchantId} setMerchantId={setMerchantId}
        topK={topK} setTopK={setTopK}
        batchText={batchText} setBatchText={setBatchText}
        batchErrors={batchErrors}
        batchRecordsCount={batchRecords.length}
        onBatchFileSelected={onBatchFileSelected}
        setExampleSingle={setExampleSingle}
        setExampleBatch={setExampleBatch}
        resetAll={resetAll}
        showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
        canSubmit={canSubmit} loading={loading} onSubmit={onSubmit} API_URL={API_URL}
      />
      
      {/* 2. Risultati: Usa SOLO modelInfo (Snapshot) */}
      <div ref={resultsRef}>
        {(resp || loading) && (
            <ResultsCard
                resp={resp}
                loading={loading}
                predictions={predictions}
                predictionsView={predictionsView}
                q={q} setQ={setQ}
                onlyLowConf={onlyLowConf} setOnlyLowConf={setOnlyLowConf}
                sortBy={sortBy} setSortBy={setSortBy}
                downloadCsv={downloadCsv}
                confidenceBadge={confidenceBadge}
                modelInfo={resultInfo}
            />
        )}
      </div>

      <TrainingCard
        trainAlgo={trainAlgo} setTrainAlgo={setTrainAlgo}
        trainLabel={trainLabel} setTrainLabel={setTrainLabel}
        trainCsv={trainCsv} setTrainCsv={setTrainCsv}
        trainJobStatus={trainJobStatus}
        startTrainingJob={startTrainingJob}
        trainJob={trainJob}
        trainStatusObj={trainStatusObj}
        trainErr={trainErr}
        setTrainJob={setTrainJob} setTrainStatusObj={setTrainStatusObj} setTrainErr={setTrainErr} setTrainJobStatus={setTrainJobStatus}
        autoSwitch={autoSwitch}
        setAutoSwitch={setAutoSwitch}
      />

      <BatchAsyncCard
        batchFile={batchFile} setBatchFile={setBatchFile}
        job={job} jobStatus={jobStatus} jobResult={jobResult}
        startAsyncBatchInferenceUpload={startAsyncBatchInferenceUpload}
        loadBatchPreviewFromCsv={loadBatchPreviewFromCsv}
        previewLoading={previewLoading} showPreview={showPreview} setShowPreview={setShowPreview}
        previewLimit={previewLimit} setPreviewLimit={setPreviewLimit}
        previewErr={previewErr} previewRows={previewRows} summaryView={summaryView}
        setJob={setJob} setJobResult={setJobResult} setJobStatus={setJobStatus}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}