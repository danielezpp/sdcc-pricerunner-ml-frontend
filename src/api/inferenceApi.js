import { fetchJson } from "./http";

export async function runInference(apiUrl, payload) {
  return fetchJson(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
