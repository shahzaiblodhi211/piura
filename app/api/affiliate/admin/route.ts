import { createAffiliate, listAffiliates, listCommissions, markCommissionsPaid } from "@/lib/affiliates";
import { commissionDue } from "@/lib/affiliate-math";

function allowed(request: Request) {
  const secret = process.env.AFFILIATE_ADMIN_SECRET;
  return Boolean(secret) && request.headers.get("x-affiliate-admin") === secret;
}

export async function POST(request: Request) {
  if (!process.env.AFFILIATE_ADMIN_SECRET) return Response.json({ error: "Affiliate admin is not configured." }, { status: 503 });
  if (!allowed(request)) return Response.json({ error: "That password is not right." }, { status: 401 });

  let body: { action?: string; name?: string; email?: string; code?: string; discountPercent?: number; commissionPercent?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Check the details and try again." }, { status: 400 });
  }

  if (body.action === "create") {
    try {
      const affiliate = await createAffiliate({
        name: body.name ?? "",
        email: body.email ?? "",
        code: body.code ?? "",
        discountPercent: body.discountPercent,
        commissionPercent: body.commissionPercent,
      });
      return Response.json({
        affiliate: {
          code: affiliate.code,
          name: affiliate.name,
          email: affiliate.email,
          discountPercent: affiliate.discountPercent,
          commissionPercent: affiliate.commissionPercent,
          dashboardPath: `/affiliate/${affiliate.token}`,
        },
      });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Could not add that creator." }, { status: 400 });
    }
  }

  if (body.action === "paid") {
    const code = (body.code ?? "").trim().toUpperCase();
    const count = await markCommissionsPaid(code);
    return Response.json({ count });
  }

  const affiliates = await listAffiliates();
  const commissions = await listCommissions();
  return Response.json({
    creators: affiliates.map((affiliate) => {
      const rows = commissions.filter((row) => row.code === affiliate.code);
      const payable = rows.filter((row) => commissionDue(row.placedAt, row.paidAt, row.commissionCents <= 0) === "payable").reduce((sum, row) => sum + row.commissionCents, 0);
      return {
        code: affiliate.code,
        name: affiliate.name,
        email: affiliate.email,
        discountPercent: affiliate.discountPercent,
        commissionPercent: affiliate.commissionPercent,
        dashboardPath: `/affiliate/${affiliate.token}`,
        payable,
        clawback: rows.reduce((sum, row) => sum + row.clawbackCents, 0),
      };
    }),
  });
}
