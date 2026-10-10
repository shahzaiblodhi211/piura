import { findAffiliate } from "@/lib/affiliates";

export async function POST(request: Request) {
  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter a discount code." }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code : "";
  let affiliate;
  try {
    affiliate = await findAffiliate(code);
  } catch {
    return Response.json({ error: "Discount codes are unavailable right now." }, { status: 503 });
  }
  if (!affiliate) return Response.json({ error: "That code isn't valid." }, { status: 404 });
  return Response.json({ code: affiliate.code, discountPercent: affiliate.discountPercent });
}
