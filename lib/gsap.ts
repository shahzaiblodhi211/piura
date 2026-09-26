"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("piura", "M0,0 C0.16,1 0.3,1 1,1");
  gsap.defaults({ ease: "piura" });
  registered = true;
}

export { gsap, ScrollTrigger };
