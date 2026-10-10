import nodemailer from "nodemailer";

const ownerEmail = process.env.OWNER_EMAIL || "piuraswim@gmail.com";
const smtpUser = process.env.SMTP_USER || "piuraswim@gmail.com";

export function mailConfigured() {
  return Boolean(process.env.SMTP_PASS && smtpUser && ownerEmail);
}

export async function notifyOwner(input: { subject: string; text: string; replyTo?: string }) {
  const pass = process.env.SMTP_PASS;
  if (!pass) throw new Error("Gmail SMTP is not configured.");

  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass },
  });

  await transport.sendMail({
    from: `Piura Swim <${smtpUser}>`,
    to: ownerEmail,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
  });
}
