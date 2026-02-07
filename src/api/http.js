
export async function fetchJson(url, options) {
  const r = await fetch(url, options);
  const text = await r.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  // API Gateway proxy style
  if (data && typeof data.body === "string") {
    try { data = JSON.parse(data.body); } catch { /*niente*/ }
  }

  return { ok: r.ok, status: r.status, data, rawText: text };
}
