export async function uploadPresignedPost(post, fileOrBlob, filename) {
  if (!post?.url || !post?.fields) {
    throw new Error("uploadPresignedPost: missing post.url or post.fields");
  }

  const form = new FormData();
  Object.entries(post.fields).forEach(([k, v]) => form.append(k, v));

  if (filename) {
    form.append("file", fileOrBlob, filename);
  } else {
    form.append("file", fileOrBlob);
  }

  const r = await fetch(post.url, { method: "POST", body: form });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    const err = new Error(`Presigned POST upload failed (HTTP ${r.status})`);
    err.status = r.status;
    err.details = t;
    throw err;
  }
}
