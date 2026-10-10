export const affiliateHoldDays = 14;

export function discountCents(amountCents: number, percent: number) {
  return Math.round((amountCents * percent) / 100);
}

export function commissionDue(placedAt: string, paidAt: string | null, voided: boolean, now = Date.now()) {
  if (voided) return "void" as const;
  if (paidAt) return "paid" as const;
  const payableAt = new Date(placedAt).getTime() + affiliateHoldDays * 24 * 60 * 60 * 1000;
  return now >= payableAt ? ("payable" as const) : ("pending" as const);
}
