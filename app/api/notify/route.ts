import { notifyOwner } from "@/lib/mail";

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function emailOk(value: string) {
  return value.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Check the details and try again." }, { status: 400 });
  }

  const kind = clip(body.kind, 40);
  const email = clip(body.email, 200);
  const phone = clip(body.phone, 40);
  const name = clip(body.name, 120);
  const message = clip(body.message, 4000);
  const product = clip(body.product, 160);
  const size = clip(body.size, 40);

  if (!emailOk(email)) return Response.json({ error: "Enter a valid email." }, { status: 400 });

  let subject = "";
  let text = "";
  if (kind === "newsletter") {
    subject = "Newsletter signup";
    text = `Email: ${email}`;
  } else if (kind === "popup") {
    subject = "Come closer signup";
    text = `Email: ${email}`;
  } else if (kind === "waitlist") {
    subject = "Waitlist signup";
    text = [`Email: ${email}`, phone ? `Phone: ${phone}` : ""].filter(Boolean).join("\n");
  } else if (kind === "reserve") {
    if (!product) return Response.json({ error: "Check the piece and try again." }, { status: 400 });
    subject = `Reserve request — ${product}`;
    text = [`Piece: ${product}`, size ? `Size: ${size}` : "", `Email: ${email}`, phone ? `Phone: ${phone}` : ""].filter(Boolean).join("\n");
  } else if (kind === "contact") {
    if (!name || !message) return Response.json({ error: "Add your name and a message." }, { status: 400 });
    subject = `Contact — ${name}`;
    text = [`Name: ${name}`, `Email: ${email}`, phone ? `Phone: ${phone}` : "", "", message].filter(Boolean).join("\n");
  } else {
    return Response.json({ error: "Check the details and try again." }, { status: 400 });
  }

  try {
    await notifyOwner({ subject, text, replyTo: email });
  } catch (error) {
    console.error("Owner email failed.", error instanceof Error ? error.message : error);
    return Response.json({ error: "Could not send that. Try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
