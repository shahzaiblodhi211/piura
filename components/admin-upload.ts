export async function uploadProductPhoto(file: File) {
  const secret = window.sessionStorage.getItem("piura-admin") ?? "";
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "x-affiliate-admin": secret },
    body,
  });
  const data = (await response.json()) as { src?: string; error?: string };
  if (!response.ok || !data.src) throw new Error(data.error || "Could not upload that photo.");
  return data.src;
}
