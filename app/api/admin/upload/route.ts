import { uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

const types = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function allowed(request: Request) {
  const secret = process.env.AFFILIATE_ADMIN_SECRET;
  return Boolean(secret) && request.headers.get("x-affiliate-admin") === secret;
}

export async function POST(request: Request) {
  if (!process.env.AFFILIATE_ADMIN_SECRET) return Response.json({ error: "Admin is not configured." }, { status: 503 });
  if (!allowed(request)) return Response.json({ error: "That password is not right." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Choose a photo to upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a photo to upload." }, { status: 400 });
  if (!types.has(file.type)) return Response.json({ error: "Use a JPG, PNG, or WebP photo." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Keep each photo under 8 MB." }, { status: 400 });

  try {
    const src = await uploadImage(Buffer.from(await file.arrayBuffer()), file.name || "photo");
    return Response.json({ src });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload that photo.";
    const status = message === "Photo hosting is not configured." ? 503 : message.startsWith("Cloudinary") ? 403 : 500;
    return Response.json({ error: message }, { status });
  }
}
