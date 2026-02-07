export function parseBatch(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const records = [];
  const errors = [];

  lines.forEach((line, idx) => {
    const parts = line.split("|");
    const title = (parts[0] ?? "").trim();
    if (!title) {
      errors.push(`Riga ${idx + 1}: Product Title vuoto`);
      return;
    }
    const merchantId =
      (parts.length >= 2 ? parts.slice(1).join("|") : "").trim() || "0";
    records.push({ "Product Title": title, "Merchant ID": merchantId });
  });

  return { records, errors };
}

export function clampInt(n, min, max, fallback) {
  const x = Number.parseInt(n, 10);
  if (Number.isNaN(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

export function confidenceBadge(conf, gap) {
  if (typeof conf !== "number") return { label: "N/A", tone: "neutral" };
  if (conf >= 0.6 && gap >= 0.1) return { label: "Alta confidenza", tone: "good" };
  if (conf >= 0.45 && gap >= 0.05) return { label: "Media confidenza", tone: "warn" };
  return { label: "Bassa confidenza", tone: "bad" };
}
