import { readFileSync } from "fs";

function loadEnv() {
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnv();
  const { getStripe } = await import("../lib/stripe");
  const { importSucceededPayments } = await import("../lib/fulfill");
  const { db } = await import("../lib/mongo");
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured.");
  const test = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
  const orders = (await db()).collection("orders");
  const before = await orders.countDocuments();
  const result = await importSucceededPayments(stripe);
  const after = await orders.countDocuments();
  console.log(JSON.stringify({ test, before, after, ...result }));
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Could not import orders.");
  process.exit(1);
});
