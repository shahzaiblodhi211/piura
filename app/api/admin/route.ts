import { createAffiliate, listAffiliates, listCommissions, markCommissionsPaid, updateAffiliate } from "@/lib/affiliates";
import { commissionDue } from "@/lib/affiliate-math";
import { adminProducts, saveProduct, seedCatalog } from "@/lib/catalog";
import { listOrders } from "@/lib/orders";

function allowed(request: Request) {
  const secret = process.env.AFFILIATE_ADMIN_SECRET;
  return Boolean(secret) && request.headers.get("x-affiliate-admin") === secret;
}

function creatorsFrom(affiliates: Awaited<ReturnType<typeof listAffiliates>>, commissions: Awaited<ReturnType<typeof listCommissions>>) {
  return affiliates.map((affiliate) => {
    const rows = commissions.filter((row) => row.code === affiliate.code);
    const pending = rows.filter((row) => commissionDue(row.placedAt, row.paidAt, row.commissionCents <= 0) === "pending").reduce((sum, row) => sum + row.commissionCents, 0);
    const payable = rows.filter((row) => commissionDue(row.placedAt, row.paidAt, row.commissionCents <= 0) === "payable").reduce((sum, row) => sum + row.commissionCents, 0);
    return {
      code: affiliate.code,
      name: affiliate.name,
      email: affiliate.email,
      discountPercent: affiliate.discountPercent,
      commissionPercent: affiliate.commissionPercent,
      dashboardPath: `/affiliate/${affiliate.token}`,
      pending,
      payable,
      clawback: rows.reduce((sum, row) => sum + row.clawbackCents, 0),
    };
  });
}

export async function POST(request: Request) {
  if (!process.env.AFFILIATE_ADMIN_SECRET) return Response.json({ error: "Admin is not configured." }, { status: 503 });
  if (!allowed(request)) return Response.json({ error: "That password is not right." }, { status: 401 });

  let body: {
    action?: string;
    product?: unknown;
    name?: string;
    email?: string;
    code?: string;
    nextCode?: string;
    discountPercent?: number;
    commissionPercent?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Check the details and try again." }, { status: 400 });
  }

  try {
    if (body.action === "products") return Response.json({ products: await adminProducts() });
    if (body.action === "save") return Response.json({ product: await saveProduct(body.product) });
    if (body.action === "seed") return Response.json(await seedCatalog());
    if (body.action === "orders") {
      return Response.json({
        orders: await listOrders(),
        testMode: (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_"),
      });
    }
    if (body.action === "creators") return Response.json({ creators: creatorsFrom(await listAffiliates(), await listCommissions()) });
    if (body.action === "create-creator") {
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
    }
    if (body.action === "update-creator") {
      await updateAffiliate(body.code ?? "", {
        name: body.name,
        email: body.email,
        code: body.nextCode,
        discountPercent: body.discountPercent,
        commissionPercent: body.commissionPercent,
      });
      return Response.json({ creators: creatorsFrom(await listAffiliates(), await listCommissions()) });
    }
    if (body.action === "paid") {
      const count = await markCommissionsPaid((body.code ?? "").trim().toUpperCase());
      return Response.json({ count, creators: creatorsFrom(await listAffiliates(), await listCommissions()) });
    }
    return Response.json({ error: "That action is not available." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save that.";
    const status = message === "MongoDB is not configured." ? 503 : 400;
    return Response.json({ error: message }, { status });
  }
}
