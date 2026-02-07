import { fetchJson } from "./http";

export async function getBatchPresigned(uploadUrlApi, filename) {
  const qs = new URLSearchParams({ filename }).toString();
  return fetchJson(`${uploadUrlApi}?${qs}`, { method: "GET" });
}
