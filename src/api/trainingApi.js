import { fetchJson } from "./http";

export async function createTrainingJob(trainingJobsApi, manifest) {
  return fetchJson(trainingJobsApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(manifest),
  });
}
