import { sleep } from "./sleep";


export async function pollJsonUrl(url, {
  method = "GET",
  delayMs = 2000,
  maxAttempts = 60,
  accept404 = false,
  isDone = () => true, 
} = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const r = await fetch(url, { method });

    if (accept404 && r.status === 404) {
      await sleep(delayMs);
      continue;
    }

    const t = await r.text();
    if (!r.ok) {
      const err = new Error(`Polling failed (HTTP ${r.status})`);
      err.status = r.status;
      err.details = t;
      throw err;
    }

    let data;
    try {
      data = JSON.parse(t);
    } catch {
      const err = new Error("Polling returned invalid JSON");
      err.status = r.status;
      err.details = t;
      throw err;
    }

    if (isDone(data)) return data;

    await sleep(delayMs);
  }

  const err = new Error("Polling timeout");
  err.status = 0;
  throw err;
}
