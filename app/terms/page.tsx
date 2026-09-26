import { LegalLayout, type LegalSection } from "@/components/legal-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Piura Swim",
  description: "Terms that govern your use of piuraswim.com and Piura Swim orders.",
};

const sections: LegalSection[] = [
  {
    id: "the-agreement",
    number: "01.",
    title: "The agreement",
    bodyWidth: 858,
    body: "These terms govern your use of piuraswim.com, operated by Piura Swim, [ISABELLA TO CONFIRM: registered legal entity name], based in Miami, Florida. By using the site, joining our list, or placing an order, you agree to them.",
  },
  {
    id: "products-availability",
    number: "02.",
    title: "Products & availability",
    body: "Our pieces are produced in limited quantities. Prices, styles, and availability may change without notice. Reserving a piece through the waitlist holds your place for first access but is not a completed purchase and does not charge you.",
  },
  {
    id: "orders-shipping-returns",
    number: "03.",
    title: "Orders, shipping & returns",
    body: "Orders ship from Miami, Florida. Free standard shipping applies to US orders over $100. For hygiene reasons, swimwear can only be returned unworn, unwashed, with the hygiene liner intact, within [ISABELLA TO CONFIRM: return window, e.g. 14 days] of delivery. [ISABELLA TO CONFIRM: refund vs. store-credit policy]. To start a return, contact us via the contact page.",
  },
  {
    id: "pricing-payment",
    number: "04.",
    title: "Pricing & payment",
    body: "All prices are in US dollars. Applicable taxes are calculated at checkout. If a piece is listed at an obviously incorrect price due to error, we may cancel the order and refund you in full.",
  },
  {
    id: "intellectual-property",
    number: "05.",
    title: "Intellectual property",
    body: "The Piura name, wordmark, prints (including Sunchild and Moonchild), photography, and site content are the property of Piura Swim and may not be reproduced without written permission.",
  },
  {
    id: "user-content",
    number: "06.",
    title: "User content",
    body: "If you tag us or share photos wearing Piura and we ask to feature them, we'll only do so with your permission. Once granted, you give us a non-exclusive license to use those images on our site and social channels with credit.",
  },
  {
    id: "liability",
    number: "07.",
    title: "Liability",
    body: "The site is provided as-is. To the fullest extent permitted by law, Piura Swim is not liable for indirect or consequential damages arising from use of the site. Nothing in these terms limits rights you have under applicable consumer law.",
  },
  {
    id: "governing-law",
    number: "08.",
    title: "Governing law",
    body: "These terms are governed by the laws of the State of Florida, USA. Questions? Reach us at [ISABELLA TO CONFIRM: support email address].",
  },
];

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" sections={sections} />
  );
}
