import { randomBytes } from "crypto";
import { MongoServerError } from "mongodb";
import { discountCents } from "@/lib/affiliate-math";
import { db } from "@/lib/mongo";

export type Affiliate = {
  code: string;
  name: string;
  email: string;
  discountPercent: number;
  commissionPercent: number;
  token: string;
  createdAt: string;
};

export type Commission = {
  paymentIntentId: string;
  orderNumber: string;
  code: string;
  originalSaleCents: number;
  saleCents: number;
  discountCents: number;
  commissionPercent: number;
  originalCommissionCents: number;
  commissionCents: number;
  clawbackCents: number;
  placedAt: string;
  paidAt: string | null;
};

async function affiliates() {
  return (await db()).collection<Affiliate>("affiliates");
}

async function commissions() {
  return (await db()).collection<Commission>("commissions");
}

export async function listAffiliates() {
  return (await affiliates()).find({}, { projection: { _id: 0 } }).toArray();
}

export async function findAffiliate(code: string) {
  const cleaned = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,20}$/.test(cleaned)) return null;
  return (await affiliates()).findOne({ code: cleaned }, { projection: { _id: 0 } });
}

export async function findAffiliateByToken(token: string) {
  if (!token || token.length < 16) return null;
  return (await affiliates()).findOne({ token }, { projection: { _id: 0 } });
}

function percent(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 50) return fallback;
  return number;
}

export async function createAffiliate(input: { name: string; email: string; code: string; discountPercent?: number; commissionPercent?: number }) {
  const name = input.name.trim().slice(0, 80);
  const email = input.email.trim().slice(0, 200);
  const code = input.code.trim().toUpperCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Add the creator's name and email.");
  if (!/^[A-Z0-9]{3,20}$/.test(code) || code === "NEW") throw new Error("Use 3 to 20 letters or numbers for the code.");
  const affiliate: Affiliate = {
    code,
    name,
    email,
    discountPercent: percent(input.discountPercent, 15),
    commissionPercent: percent(input.commissionPercent, 15),
    token: randomBytes(24).toString("base64url"),
    createdAt: new Date().toISOString(),
  };
  try {
    await (await affiliates()).insertOne(affiliate);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) throw new Error("That code is already in use.");
    throw error;
  }
  return affiliate;
}

export async function updateAffiliate(code: string, input: { name?: string; email?: string; code?: string; discountPercent?: number; commissionPercent?: number }) {
  const cleaned = code.trim().toUpperCase();
  const current = await findAffiliate(cleaned);
  if (!current) throw new Error("That creator was not found.");
  const nextCode = (input.code ?? cleaned).trim().toUpperCase();
  const name = input.name === undefined ? current.name : input.name.trim().slice(0, 80);
  const email = input.email === undefined ? current.email : input.email.trim().slice(0, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Add the creator's name and email.");
  if (!/^[A-Z0-9]{3,20}$/.test(nextCode) || nextCode === "NEW") throw new Error("Use 3 to 20 letters or numbers for the code.");
  const next = {
    code: nextCode,
    name,
    email,
    discountPercent: input.discountPercent === undefined ? current.discountPercent : percent(input.discountPercent, current.discountPercent),
    commissionPercent: input.commissionPercent === undefined ? current.commissionPercent : percent(input.commissionPercent, current.commissionPercent),
  };
  try {
    await (await affiliates()).updateOne({ code: cleaned }, { $set: next });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) throw new Error("That code is already in use.");
    throw error;
  }
  if (nextCode !== cleaned) await (await commissions()).updateMany({ code: cleaned }, { $set: { code: nextCode } });
  return { ...current, ...next };
}

export async function listCommissions() {
  return (await commissions()).find({}, { projection: { _id: 0 } }).toArray();
}

export async function recordCommission(input: {
  paymentIntentId: string;
  orderNumber: string;
  code: string;
  saleCents: number;
  discountCents: number;
  commissionPercent: number;
  placedAt: string;
}) {
  const commission = discountCents(input.saleCents, input.commissionPercent);
  const row: Commission = {
    paymentIntentId: input.paymentIntentId,
    orderNumber: input.orderNumber,
    code: input.code,
    originalSaleCents: input.saleCents,
    saleCents: input.saleCents,
    discountCents: input.discountCents,
    commissionPercent: input.commissionPercent,
    originalCommissionCents: commission,
    commissionCents: commission,
    clawbackCents: 0,
    placedAt: input.placedAt,
    paidAt: null,
  };
  try {
    await (await commissions()).insertOne(row);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return;
    throw error;
  }
}

export async function applyCommissionRefund(paymentIntentId: string, amountRefunded: number) {
  const collection = await commissions();
  const row = await collection.findOne({ paymentIntentId }, { projection: { _id: 0 } });
  if (!row || row.originalSaleCents <= 0) return;
  const remaining = Math.max(0, row.originalSaleCents - amountRefunded);
  const next = Math.round((row.originalCommissionCents * remaining) / row.originalSaleCents);
  const clawback = row.paidAt && next < row.commissionCents ? row.clawbackCents + (row.commissionCents - next) : row.clawbackCents;
  await collection.updateOne({ paymentIntentId }, { $set: { saleCents: remaining, commissionCents: next, clawbackCents: clawback } });
}

export async function markCommissionsPaid(code: string) {
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const result = await (await commissions()).updateMany(
    { code, paidAt: null, commissionCents: { $gt: 0 }, placedAt: { $lte: cutoff } },
    { $set: { paidAt: now } },
  );
  return result.modifiedCount;
}
