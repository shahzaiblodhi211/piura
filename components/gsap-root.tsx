"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";

export function GsapRoot({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerGsap();
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const cleanups: Array<() => void> = [];
    const canHover = window.matchMedia("(hover: hover)").matches;

    const ctx = gsap.context(() => {
      const intro = root.querySelectorAll("[data-intro]");
      const words = root.querySelectorAll("[data-title-word]");
      const tocItems = root.querySelectorAll("[data-toc-item]");
      const photos = root.querySelectorAll<HTMLElement>("[data-photo]");
      const features = root.querySelectorAll<HTMLElement>("[data-feature]");
      const forms = root.querySelectorAll<HTMLElement>("[data-form]");
      const fields = root.querySelectorAll<HTMLElement>("[data-field]");
      const notes = root.querySelectorAll("[data-note]");
      const reveals = root.querySelectorAll("[data-reveal]");
      const track = root.querySelector<HTMLElement>("[data-marquee]");
      const tabs = root.querySelectorAll<HTMLElement>("[data-tab]");
      const productCards = root.querySelectorAll<HTMLElement>("[data-product]");

      if (intro.length) gsap.set(intro, { y: 36, opacity: 0 });
      if (words.length) {
        gsap.set(words, {
          yPercent: 118,
          rotateX: 48,
          transformOrigin: "50% 100%",
        });
      }
      if (tocItems.length) gsap.set(tocItems, { x: 36, opacity: 0 });
      if (reveals.length) gsap.set(reveals, { y: 56, opacity: 0 });

      const timeline = gsap.timeline({ defaults: { ease: "piura" } });

      timeline.from(
        "[data-chrome]",
        { y: -28, opacity: 0, duration: 1.05, stagger: 0.1 },
        0,
      );
      if (intro.length) {
        timeline.to(
          intro,
          { y: 0, opacity: 1, duration: 1.15, stagger: 0.14 },
          0.18,
        );
      }
      if (words.length) {
        timeline.to(
          words,
          { yPercent: 0, rotateX: 0, duration: 1.25, stagger: 0.075 },
          0.28,
        );
      }
      if (tocItems.length) {
        timeline.to(
          tocItems,
          { x: 0, opacity: 1, duration: 0.95, stagger: 0.07, ease: "power3.out" },
          0.35,
        );
      }

      photos.forEach((wrap) => {
        const img =
          wrap.querySelector<HTMLElement>("[data-photo-img]") ??
          wrap.querySelector<HTMLElement>("img");
        if (!img) return;

        const kind = wrap.getAttribute("data-photo");
        if (kind === "hero") {
          gsap.set(wrap, { autoAlpha: 1 });
          gsap.fromTo(
            img,
            { scale: 1.08 },
            { scale: 1, duration: 1.8, ease: "power3.out" },
          );
          return;
        }

        gsap.set(wrap, { autoAlpha: 1, clipPath: "inset(100% 0 0 0)" });
        gsap.set(img, {
          scale: kind === "product" ? 1.12 : 1.2,
          yPercent: 0,
          transformOrigin: "50% 60%",
        });

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });

        reveal
          .to(wrap, { clipPath: "inset(0% 0 0 0)", duration: 1.45, ease: "piura" })
          .to(img, { scale: 1, duration: 1.7, ease: "power3.out" }, 0);

        if (kind === "product") return;

        gsap.to(img, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      });

      forms.forEach((form) => {
        const items = form.querySelectorAll<HTMLElement>(
          "[data-field], [data-btn], [data-note]",
        );

        gsap.set(form, {
          autoAlpha: 1,
          x: 72,
          clipPath: "inset(0 18% 0 0)",
          filter: "blur(10px)",
        });
        gsap.set(items, { y: 36, opacity: 0 });

        const formTl = gsap.timeline({
          scrollTrigger: {
            trigger: form,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });

        formTl
          .to(form, {
            x: 0,
            clipPath: "inset(0 0% 0 0)",
            filter: "blur(0px)",
            duration: 1.25,
            ease: "piura",
          })
          .to(
            items,
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              stagger: 0.1,
              ease: "piura",
            },
            0.28,
          );
      });

      if (!forms.length && notes.length) {
        gsap.set(notes, { y: 20, opacity: 0 });
        gsap.to(notes, {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: { trigger: notes[0], start: "top 88%" },
        });
      }

      fields.forEach((field) => {
        const onFocus = () => {
          gsap.to(field, {
            boxShadow: "0 10px 28px rgba(53,53,36,0.08)",
            y: -2,
            duration: 0.45,
            ease: "piura",
            overwrite: "auto",
          });
        };
        const onBlur = () => {
          gsap.to(field, {
            boxShadow: "0 0 0 rgba(53,53,36,0)",
            y: 0,
            duration: 0.5,
            ease: "piura",
            overwrite: "auto",
          });
        };
        field.addEventListener("focus", onFocus);
        field.addEventListener("blur", onBlur);
        cleanups.push(() => {
          field.removeEventListener("focus", onFocus);
          field.removeEventListener("blur", onBlur);
        });
      });

      features.forEach((item, index) => {
        const icon = item.querySelector<HTMLElement>("[data-feature-icon]");
        const copy = item.querySelectorAll("p");

        gsap.set(item, { autoAlpha: 1 });
        if (icon) gsap.set(icon, { scale: 0.72, rotate: -10, opacity: 0, transformOrigin: "50% 50%" });
        gsap.set(copy, { y: 22, opacity: 0 });

        const featureTl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          delay: index * 0.08,
        });

        if (icon) {
          featureTl.to(icon, {
            scale: 1,
            rotate: 0,
            opacity: 1,
            duration: 1.15,
            ease: "piura",
          });
        }
        featureTl.to(
          copy,
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "piura" },
          icon ? 0.18 : 0,
        );

        if (canHover) {
          bindHover(
            item,
            () => {
              if (icon) {
                gsap.to(icon, { y: -8, rotate: 4, duration: 0.55, ease: "piura", overwrite: "auto" });
              }
              gsap.to(item, { y: -3, duration: 0.55, ease: "piura", overwrite: "auto" });
            },
            () => {
              if (icon) {
                gsap.to(icon, { y: 0, rotate: 0, duration: 0.65, ease: "piura", overwrite: "auto" });
              }
              gsap.to(item, { y: 0, duration: 0.65, ease: "piura", overwrite: "auto" });
            },
          );
        }
      });

      reveals.forEach((el) => {
        const kids = el.querySelectorAll<HTMLElement>(":scope > *");
        if (kids.length > 1) {
          gsap.set(el, { y: 0, opacity: 1 });
          gsap.set(kids, { y: 32, opacity: 0 });
          gsap.to(kids, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "piura",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              toggleActions: "play none none none",
            },
          });
          return;
        }
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "piura",
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
            toggleActions: "play none none none",
          },
        });
      });

      if (tabs.length) {
        gsap.set(tabs, { y: 22, opacity: 0 });
        gsap.to(tabs, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.06,
          ease: "piura",
          scrollTrigger: {
            trigger: tabs[0],
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });

        tabs.forEach((tab) => {
          if (!canHover) return;
          bindHover(
            tab,
            () => {
              gsap.to(tab, {
                y: -3,
                scale: 1.03,
                duration: 0.45,
                ease: "piura",
                overwrite: "auto",
              });
            },
            () => {
              gsap.to(tab, {
                y: 0,
                scale: 1,
                duration: 0.55,
                ease: "piura",
                overwrite: "auto",
              });
            },
          );
        });
      }

      productCards.forEach((card) => {
        const media = card.querySelector<HTMLElement>("[data-product-media]");
        const img = card.querySelector<HTMLElement>("[data-photo-img]");
        const name = card.querySelector<HTMLElement>("[data-product-name]");
        const price = card.querySelector<HTMLElement>("[data-product-price]");
        if (!canHover || !img) return;

        const xTo = gsap.quickTo(img, "xPercent", { duration: 0.7, ease: "piura" });
        const yTo = gsap.quickTo(img, "yPercent", { duration: 0.7, ease: "piura" });

        const onMove = (event: MouseEvent) => {
          if (!media) return;
          const rect = media.getBoundingClientRect();
          xTo(((event.clientX - rect.left) / rect.width - 0.5) * 6);
          yTo(((event.clientY - rect.top) / rect.height - 0.5) * 6);
        };

        const onEnter = () => {
          gsap.to(card, { y: -8, duration: 0.55, ease: "piura", overwrite: "auto" });
          gsap.to(img, {
            scale: 1.08,
            duration: 0.85,
            ease: "piura",
            overwrite: "auto",
          });
          if (media) {
            gsap.to(media, {
              backgroundColor: "rgba(245,240,236,0.92)",
              duration: 0.5,
              ease: "piura",
              overwrite: "auto",
            });
          }
          if (name) gsap.to(name, { y: -3, duration: 0.45, ease: "piura", overwrite: "auto" });
          if (price) {
            gsap.to(price, {
              y: -3,
              color: "#816c4f",
              duration: 0.45,
              ease: "piura",
              overwrite: "auto",
            });
          }
        };

        const onLeave = () => {
          xTo(0);
          yTo(0);
          gsap.to(card, { y: 0, duration: 0.7, ease: "piura", overwrite: "auto" });
          gsap.to(img, { scale: 1, duration: 0.9, ease: "piura", overwrite: "auto" });
          if (media) {
            gsap.to(media, {
              backgroundColor: "rgba(245,240,236,0.48)",
              duration: 0.6,
              ease: "piura",
              overwrite: "auto",
            });
          }
          if (name) gsap.to(name, { y: 0, duration: 0.55, ease: "piura", overwrite: "auto" });
          if (price) {
            gsap.to(price, {
              y: 0,
              color: "#353524",
              duration: 0.55,
              ease: "piura",
              overwrite: "auto",
            });
          }
        };

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
        });
      });

      if (track) {
        gsap.to(track, {
          xPercent: -50,
          duration: 28,
          ease: "none",
          repeat: -1,
        });
      }

      function bindHover(el: HTMLElement, enter: () => void, leave: () => void) {
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
      }

      root.querySelectorAll<HTMLElement>("[data-btn]").forEach((button) => {
        if (canHover) {
          const xTo = gsap.quickTo(button, "x", { duration: 0.45, ease: "piura" });
          const yTo = gsap.quickTo(button, "y", { duration: 0.45, ease: "piura" });

          const onMove = (event: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            xTo((event.clientX - rect.left - rect.width / 2) * 0.22);
            yTo((event.clientY - rect.top - rect.height / 2) * 0.28);
          };
          const onEnter = () => {
            gsap.to(button, {
              scale: 1.03,
              duration: 0.45,
              ease: "piura",
              overwrite: "auto",
            });
          };
          const onLeave = () => {
            xTo(0);
            yTo(0);
            gsap.to(button, {
              scale: 1,
              duration: 0.7,
              ease: "elastic.out(1, 0.55)",
              overwrite: "auto",
            });
          };

          button.addEventListener("mousemove", onMove);
          button.addEventListener("mouseenter", onEnter);
          button.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            button.removeEventListener("mousemove", onMove);
            button.removeEventListener("mouseenter", onEnter);
            button.removeEventListener("mouseleave", onLeave);
          });
        }
      });

      root.querySelectorAll<HTMLElement>("[data-nav-link]").forEach((link) => {
        const active = link.hasAttribute("data-nav-active");
        gsap.set(link, { backgroundSize: active ? "100% 1px" : "0% 1px" });
        bindHover(
          link,
          () =>
            gsap.to(link, {
              backgroundSize: "100% 1px",
              duration: 0.5,
              ease: "piura",
            }),
          () =>
            gsap.to(link, {
              backgroundSize: active ? "100% 1px" : "0% 1px",
              duration: 0.45,
              ease: "power3.inOut",
            }),
        );
      });

      tocItems.forEach((item) => {
        const arrow = item.querySelector<HTMLElement>("[data-toc-arrow]");
        bindHover(
          item as HTMLElement,
          () => {
            gsap.to(item, { color: "#353524", duration: 0.3 });
            if (arrow) gsap.to(arrow, { x: 5, y: -5, duration: 0.45, ease: "piura" });
          },
          () => {
            if (arrow) gsap.to(arrow, { x: 0, y: 0, duration: 0.45, ease: "piura" });
          },
        );
      });

      root.querySelectorAll<HTMLElement>("[data-logo]").forEach((logo) => {
        bindHover(
          logo,
          () => gsap.to(logo, { opacity: 0.65, duration: 0.35, ease: "piura" }),
          () => gsap.to(logo, { opacity: 1, duration: 0.35, ease: "piura" }),
        );
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="w-full bg-white">
      {children}
    </div>
  );
}
