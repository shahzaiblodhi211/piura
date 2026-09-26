import { LegalLayout, type LegalSection } from "@/components/legal-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Piura Swim",
  description:
    "What Piura Swim collects through piuraswim.com and how that information is used.",
};

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    number: "01.",
    title: "Who we are",
    bodyWidth: 858,
    body: "Piura Swim (“Piura,” “we,” “us”) is a swimwear brand based in Miami, Florida, operated by [ISABELLA TO CONFIRM: registered legal entity name]. This policy explains what we collect through piuraswim.com and how we use it.",
  },
  {
    id: "what-we-collect",
    number: "02.",
    title: "What we collect",
    bullets: [
      {
        multiline: true,
        text: "Contact details — email address and, if you choose to share it, phone number, when you join our list, reserve a piece, or write to us.",
      },
      {
        multiline: true,
        text: "Order details — name, shipping address, and purchase history when checkout is available. Payments are processed by our payment providers; we never see or store full card numbers.",
      },
      {
        text: "Basic usage data — pages visited and device type, used only to improve the site.",
      },
    ],
  },
  {
    id: "how-we-use-it",
    number: "03.",
    title: "How we use it",
    bullets: [
      {
        text: "To send drop announcements, restock alerts, and first-access invitations you signed up for.",
      },
      {
        text: "To fulfill and ship orders and answer your messages.",
      },
      {
        text: "To understand what the community loves so we make better pieces.",
      },
    ],
  },
  {
    id: "email-sms",
    number: "04.",
    title: "Email & SMS",
    body: "You can unsubscribe from emails at any time via the link in any message. If you share your phone number, we'll only text you about first access and restocks, and you can reply STOP to opt out.",
  },
  {
    id: "cookies",
    number: "05.",
    title: "Cookies",
    body: "We use only the cookies and session storage needed for the site to function (for example, remembering that you've already seen our signup invitation). Analytics, if enabled, are configured without selling or sharing data for advertising.",
  },
  {
    id: "your-rights",
    number: "06.",
    title: "Your rights",
    body: "You may request a copy of the information we hold about you, ask us to correct it, or ask us to delete it. Write to us at [ISABELLA TO CONFIRM: support email address] and we'll take care of it. If you are a resident of a jurisdiction with specific privacy rights (such as California or the EU), those rights are honored here.",
  },
  {
    id: "changes",
    number: "07.",
    title: "Changes",
    body: "If this policy changes, the date above will change with it. Material changes will be announced by email to subscribers.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" sections={sections} />
  );
}
