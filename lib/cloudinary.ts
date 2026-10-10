import { v2 as cloudinary } from "cloudinary";

function ready() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function client() {
  if (!ready()) throw new Error("Photo hosting is not configured.");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

function upload(buffer: Buffer, publicId: string, overwrite: boolean) {
  const cloudinary = client();
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = { public_id: publicId, timestamp };
  if (overwrite) params.overwrite = "true";
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET ?? "");
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)]), "photo");
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", process.env.CLOUDINARY_API_KEY ?? "");
  form.append("signature", signature);
  if (overwrite) form.append("overwrite", "true");
  return fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: form }).then(async (response) => {
    const data = (await response.json()) as { secure_url?: string; error?: { message?: string } };
    if (response.ok && data.secure_url) return data.secure_url;
    const message = data.error?.message ?? "";
    if (message.includes("missing permissions")) throw new Error("Cloudinary blocked that upload. This API key is not allowed to add photos.");
    throw new Error("Could not upload that photo.");
  });
}

export function uploadImage(buffer: Buffer, filename: string) {
  const base = filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "photo";
  return upload(buffer, `piura/studio/${base}-${Date.now().toString(36)}`, false);
}

export function uploadNamed(buffer: Buffer, publicPath: string) {
  const id = publicPath.replace(/^\/+/, "").replace(/\.[^.]+$/, "");
  return upload(buffer, `piura/${id}`, true);
}
