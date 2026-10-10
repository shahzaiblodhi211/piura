"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { uploadProductPhoto } from "@/components/admin-upload";
import { field, label, panel, useAdmin, useToast } from "@/components/admin-ui";
import { ShimmerImage } from "@/components/shimmer-image";
import type { Product, SizeRun } from "@/lib/products";

type StoredProduct = Product & { slug: string; sort: number };
type RunDraft = { piece: string; s: string; m: string; l: string; xl: string };
type Photo = { src: string; alt: string };
type Draft = {
  slug: string;
  name: string;
  src: string;
  alt: string;
  kind: Product["kind"];
  collection: Product["collection"];
  price: string;
  preorder: boolean;
  hidden: boolean;
  colorway: string;
  fabric: string;
  details: string;
  production: string;
  sizeChart: string;
  gallery: Photo[];
  runs: RunDraft[];
};

const kinds: Product["kind"][] = ["bikini", "onepiece", "top", "bottom"];
const collections: Product["collection"][] = ["triangle", "contour", "onepiece", "sunchild", "moonchild", "bella", "bali", "sara", "marina", "classics"];

function qty(run: SizeRun | undefined, size: string) {
  return String(run?.counts.find((row) => row.size === size)?.qty ?? 0);
}

function blankRun(piece: string): RunDraft {
  return { piece, s: "0", m: "0", l: "0", xl: "0" };
}

function blankDraft(): Draft {
  return {
    slug: "",
    name: "",
    src: "",
    alt: "",
    kind: "bikini",
    collection: "triangle",
    price: "",
    preorder: true,
    hidden: false,
    colorway: "",
    fabric: "",
    details: "",
    production: "",
    sizeChart: "",
    gallery: [],
    runs: [blankRun("Top"), blankRun("Bottom")],
  };
}

function photosFrom(product: StoredProduct): Photo[] {
  const gallery = product.gallery.map((image) => ({ src: image.src, alt: image.alt || product.alt }));
  const cover = gallery.findIndex((image) => image.src === product.src);
  if (cover > 0) {
    const [image] = gallery.splice(cover, 1);
    gallery.unshift(image);
  } else if (cover < 0 && product.src) {
    gallery.unshift({ src: product.src, alt: product.alt });
  }
  return gallery;
}

function withPhotos(draft: Draft, gallery: Photo[]): Draft {
  return { ...draft, gallery, src: gallery[0]?.src ?? "", alt: gallery[0]?.alt || draft.alt };
}

function toDraft(product: StoredProduct): Draft {
  const gallery = photosFrom(product);
  return {
    slug: product.slug,
    name: product.name,
    src: gallery[0]?.src ?? product.src,
    alt: gallery[0]?.alt || product.alt,
    kind: product.kind,
    collection: product.collection,
    price: typeof product.price === "number" ? String(product.price) : "",
    preorder: Boolean(product.preorder),
    hidden: Boolean(product.hidden),
    colorway: product.colorway,
    fabric: product.fabric,
    details: product.details,
    production: product.production ?? "",
    sizeChart: product.sizeChart ?? "",
    gallery,
    runs: product.runs.map((run) => ({ piece: run.piece, s: qty(run, "S"), m: qty(run, "M"), l: qty(run, "L"), xl: qty(run, "XL") })),
  };
}

function payloadFrom(draft: Draft) {
  const gallery = draft.gallery.filter((image) => image.src);
  return {
    slug: draft.slug,
    name: draft.name,
    src: gallery[0]?.src || draft.src,
    alt: draft.alt,
    kind: draft.kind,
    collection: draft.collection,
    price: draft.price.trim() === "" ? null : Number(draft.price),
    preorder: draft.preorder,
    hidden: draft.hidden,
    colorway: draft.colorway,
    fabric: draft.fabric,
    details: draft.details,
    production: draft.production,
    sizeChart: draft.sizeChart,
    gallery,
    runs: draft.runs.map((run) => ({
      piece: run.piece,
      counts: [
        { size: "S", qty: Number(run.s) },
        { size: "M", qty: Number(run.m) },
        { size: "L", qty: Number(run.l) },
        { size: "XL", qty: Number(run.xl) },
      ],
    })),
  };
}

export function AdminProductForm({ slug }: { slug?: string }) {
  const { call } = useAdmin();
  const toast = useToast();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(slug ? null : blankDraft());
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slug) return;
    let live = true;
    call({ action: "products" })
      .then((data) => {
        const products = (data.products as StoredProduct[]) ?? [];
        const product = products.find((item) => item.slug === slug);
        if (!live) return;
        if (!product) {
          toast("That product was not found.", "bad");
          router.replace("/admin/products");
          return;
        }
        setDraft(toDraft(product));
      })
      .catch((err: unknown) => {
        if (live) toast(err instanceof Error ? err.message : "Could not open that product.", "bad");
      });
    return () => {
      live = false;
    };
  }, [call, router, slug, toast]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    try {
      await call({ action: "save", product: payloadFrom(draft) });
      toast("Product saved.");
      router.push("/admin/products");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save that product.", "bad");
    } finally {
      setBusy(false);
    }
  }

  async function addPhotos(list: FileList | null) {
    if (!draft || !list?.length) return;
    setUploading(true);
    try {
      const added: Photo[] = [];
      for (const file of Array.from(list)) added.push({ src: await uploadProductPhoto(file), alt: draft.alt || draft.name });
      setDraft((current) => (current ? withPhotos(current, [...current.gallery, ...added]) : current));
      toast(added.length === 1 ? "Photo uploaded." : `${added.length} photos uploaded.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not upload that photo.", "bad");
    } finally {
      setUploading(false);
    }
  }

  async function addChart(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadProductPhoto(file);
      setDraft((current) => (current ? { ...current, sizeChart: src } : current));
      toast("Size chart uploaded.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not upload that photo.", "bad");
    } finally {
      setUploading(false);
    }
  }

  if (!draft) {
    return (
      <div>
        <div className="piura-shimmer h-4 w-24" />
        <div className="piura-shimmer mt-4 h-12 w-56" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="piura-shimmer aspect-[3/4]" />
          <div className="grid gap-4">
            <div className="piura-shimmer h-56" />
            <div className="piura-shimmer h-72" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void save(event)} className="pb-28">
      <Link href="/admin/products" className="font-serif text-[14px] text-brown">Products</Link>
      <h1 className="mt-2 font-bebas text-[40px] leading-none text-olive sm:text-[52px]">{draft.slug ? "Edit product" : "New product"}</h1>
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className={`${panel} lg:sticky lg:top-8`}>
          <div className="relative aspect-[3/4] overflow-hidden bg-[#efeae4]">
            {draft.src ? <ShimmerImage src={draft.src} alt="" className="size-full object-cover object-[center_18%]" /> : <span className="absolute inset-0 flex items-center justify-center font-serif text-[14px] text-body">Add a photo</span>}
          </div>
          {draft.gallery.length > 0 ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {draft.gallery.map((photo, index) => (
                <button key={`${photo.src}-${index}`} type="button" onClick={() => setDraft(withPhotos(draft, [photo, ...draft.gallery.filter((_, item) => item !== index)]))} className={`relative aspect-[3/4] overflow-hidden ${index === 0 ? "ring-2 ring-olive" : ""}`}>
                  <ShimmerImage src={photo.src} alt="" className="size-full object-cover object-[center_18%]" />
                </button>
              ))}
            </div>
          ) : null}
          <p className="mt-4 font-bebas text-[20px] leading-none text-olive uppercase">{draft.name || "Untitled"}</p>
          <p className="mt-2 font-serif text-[14px] text-body">{draft.price ? `$${draft.price}` : "Coastlines pricing"}</p>
        </div>
        <div className="grid gap-4">
          <section className={panel}>
            <h2 className="font-bebas text-[24px] tracking-[0.06em] text-olive">Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2"><span className={label}>Name</span><input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={field} /></label>
              <label className="block"><span className={label}>Type</span>
                <select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as Product["kind"] })} className={field}>
                  {kinds.map((kind) => <option key={kind} value={kind}>{kind === "onepiece" ? "One-piece" : kind[0].toUpperCase() + kind.slice(1)}</option>)}
                </select>
              </label>
              <label className="block"><span className={label}>Collection</span>
                <select value={draft.collection} onChange={(event) => setDraft({ ...draft, collection: event.target.value as Product["collection"] })} className={field}>
                  {collections.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2"><span className={label}>Price in dollars</span><input inputMode="decimal" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="Leave blank for Coastlines piece prices" className={field} /></label>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setDraft({ ...draft, preorder: !draft.preorder })} className="flex h-14 items-center justify-between border border-[#e6dfd8] px-4 text-left">
                <span className="font-serif text-[15px] text-ink">Preorder</span>
                <span className={`relative h-6 w-11 ${draft.preorder ? "bg-olive" : "bg-olive/20"}`}><span className={`absolute top-0.5 size-5 bg-white transition ${draft.preorder ? "left-5" : "left-0.5"}`} /></span>
              </button>
              <button type="button" onClick={() => setDraft({ ...draft, hidden: !draft.hidden })} className="flex h-14 items-center justify-between border border-[#e6dfd8] px-4 text-left">
                <span className="font-serif text-[15px] text-ink">Hide from shop</span>
                <span className={`relative h-6 w-11 ${draft.hidden ? "bg-olive" : "bg-olive/20"}`}><span className={`absolute top-0.5 size-5 bg-white transition ${draft.hidden ? "left-5" : "left-0.5"}`} /></span>
              </button>
            </div>
          </section>
          <section className={panel}>
            <h2 className="font-bebas text-[24px] tracking-[0.06em] text-olive">Photos</h2>
            <div className="mt-4 grid gap-4">
              <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(event) => { void addPhotos(event.target.files); event.target.value = ""; }} />
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(event) => { void addPhotos(event.target.files); event.target.value = ""; }} />
              <input ref={chartRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(event) => { void addChart(event.target.files); event.target.value = ""; }} />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {draft.gallery.map((photo, index) => (
                  <div key={`${photo.src}-${index}`} className="relative">
                    <button type="button" onClick={() => setDraft(withPhotos(draft, [photo, ...draft.gallery.filter((_, item) => item !== index)]))} className={`relative block aspect-[3/4] w-full overflow-hidden bg-[#efeae4] ${index === 0 ? "ring-2 ring-olive" : ""}`}>
                      <ShimmerImage src={photo.src} alt="" className="size-full object-cover object-[center_18%]" />
                    </button>
                    {index === 0 ? <span className="absolute top-1 left-1 bg-olive px-1.5 py-0.5 font-bebas text-[11px] tracking-[0.08em] text-cream">Cover</span> : null}
                    <button type="button" onClick={() => setDraft(withPhotos(draft, draft.gallery.filter((_, item) => item !== index)))} className="absolute top-1 right-1 flex size-6 items-center justify-center bg-white/90 font-serif text-[16px] leading-none text-olive" aria-label="Remove photo">×</button>
                  </div>
                ))}
                {uploading ? <div className="piura-shimmer aspect-[3/4]" /> : null}
                <button type="button" onClick={() => (draft.gallery.length ? galleryRef : coverRef).current?.click()} className="flex aspect-[3/4] items-center justify-center border border-dashed border-olive/30 font-serif text-[14px] text-olive">
                  Upload
                </button>
              </div>
              <label className="block"><span className={label}>Photo description</span><input value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value, gallery: draft.gallery.map((photo, index) => index === 0 ? { ...photo, alt: event.target.value } : photo) })} className={field} /></label>
              <div>
                <span className={label}>Size chart</span>
                {draft.sizeChart ? (
                  <div className="relative h-40 max-w-[220px] overflow-hidden border border-[#e6dfd8] bg-[#f7f3ee]">
                    <ShimmerImage src={draft.sizeChart} alt="" className="size-full object-contain" />
                    <button type="button" onClick={() => setDraft({ ...draft, sizeChart: "" })} className="absolute top-1 right-1 flex size-6 items-center justify-center bg-white/90 font-serif text-[16px] leading-none text-olive" aria-label="Remove size chart">×</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => chartRef.current?.click()} className="flex h-12 items-center justify-center border border-dashed border-olive/30 px-5 font-serif text-[15px] text-olive">Upload size chart</button>
                )}
              </div>
            </div>
          </section>
          <section className={panel}>
            <h2 className="font-bebas text-[24px] tracking-[0.06em] text-olive">Copy</h2>
            <div className="mt-4 grid gap-4">
              <label className="block"><span className={label}>Colorway</span><textarea value={draft.colorway} onChange={(event) => setDraft({ ...draft, colorway: event.target.value })} rows={3} className={`${field} h-auto py-3`} /></label>
              <label className="block"><span className={label}>Fabric</span><textarea value={draft.fabric} onChange={(event) => setDraft({ ...draft, fabric: event.target.value })} rows={3} className={`${field} h-auto py-3`} /></label>
              <label className="block"><span className={label}>Description</span><textarea value={draft.details} onChange={(event) => setDraft({ ...draft, details: event.target.value })} rows={4} placeholder="Shown under the price" className={`${field} h-auto py-3`} /></label>
              <label className="block"><span className={label}>Production details</span><textarea value={draft.production} onChange={(event) => setDraft({ ...draft, production: event.target.value })} rows={4} placeholder="Shown in the Production details section" className={`${field} h-auto py-3`} /></label>
            </div>
          </section>
          <section className={panel}>
            <h2 className="font-bebas text-[24px] tracking-[0.06em] text-olive">Inventory</h2>
            <div className="mt-4 grid gap-4">
              {draft.runs.map((run, index) => (
                <div key={`${run.piece}-${index}`} className="border border-[#e6dfd8] p-3 sm:p-4">
                  <label className="block"><span className={label}>Piece</span><input value={run.piece} onChange={(event) => setDraft({ ...draft, runs: draft.runs.map((item, itemIndex) => itemIndex === index ? { ...item, piece: event.target.value } : item) })} className={field} /></label>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {(["s", "m", "l", "xl"] as const).map((size) => (
                      <label key={size} className="block">
                        <span className={label}>{size.toUpperCase()}</span>
                        <input inputMode="numeric" value={run[size]} onChange={(event) => setDraft({ ...draft, runs: draft.runs.map((item, itemIndex) => itemIndex === index ? { ...item, [size]: event.target.value } : item) })} className={`${field} px-2 text-center`} />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setDraft({ ...draft, runs: [...draft.runs, blankRun("Piece")] })} className="h-12 border border-olive/20 font-serif text-[15px] text-olive">
                Add size run
              </button>
            </div>
          </section>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-olive/10 bg-cream/95 px-4 py-3 backdrop-blur lg:left-[232px]">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-end gap-2 sm:gap-3 sm:px-4">
          <Link href="/admin/products" className="flex h-12 flex-1 items-center justify-center border border-olive/20 bg-white px-5 font-bebas text-[18px] tracking-[0.1em] text-olive sm:flex-none">
            Cancel
          </Link>
          <button type="submit" disabled={busy || uploading || !draft.src} className="flex h-12 flex-1 items-center justify-center bg-olive px-6 font-bebas text-[18px] tracking-[0.1em] text-cream disabled:opacity-60 sm:flex-none">
            {busy ? "Saving" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
