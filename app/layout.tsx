import type { Metadata } from "next";
import { Bebas_Neue, Besley, League_Spartan } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const besley = Besley({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-besley",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-league-spartan",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

export const metadata: Metadata = {
  title: "Piura Swim",
  description: "Designed in Miami. Crafted in Piura, Peru — The City of Eternal Heat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${besley.variable} ${leagueSpartan.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white font-serif text-olive">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
