"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { field, useAdmin, useToast } from "@/components/admin-ui";
import { ShimmerImage } from "@/components/shimmer-image";
import { productPriceLine, type Product } from "@/lib/products";

type StoredProduct = Product & { slug: string; sort: number };

export function AdminProducts() {
  const { call } = useAdmin();
  const toast = useToast();
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    call({ action: "products" })
      .then((data) => {
        if (live) setProducts((data.products as StoredProduct[]) ?? []);
      })
      .catch((err: unknown) => {
        if (live) toast(err instanceof Error ? err.message : "Could not load products.", "bad");
      })
      .finally(() => {
        if (live) setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, [call, toast]);

  async function syncCatalog() {
    setBusy(true);
    try {
      const data = await call({ action: "seed" });
      const added = Number(data.added ?? 0);
      const kept = Number(data.kept ?? 0);
      const listed = await call({ action: "products" });
      setProducts((listed.products as StoredProduct[]) ?? []);
      toast(added ? `Added ${added} product${added === 1 ? "" : "s"}. ${kept} already saved were left as they are.` : `All ${kept} current products are already in the database.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not sync the catalog.", "bad");
    } finally {
      setBusy(false);
    }
  }

  const shown = products.filter((product) => product.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-[13px] tracking-[0.18em] text-brown uppercase">Catalog</p>
          <h1 className="mt-1 font-bebas text-[40px] leading-none text-olive sm:text-[52px]">Products</h1>
          <p className="mt-2 font-serif text-[15px] text-body">{loaded ? `${products.length} pieces in the shop` : "Loading pieces"}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/products/new" className="flex h-12 items-center justify-center bg-olive px-5 font-bebas text-[18px] tracking-[0.1em] text-cream">
            New product
          </Link>
          <button type="button" disabled={busy} onClick={() => void syncCatalog()} className="h-12 border border-olive/20 bg-white px-5 font-bebas text-[18px] tracking-[0.1em] text-olive disabled:opacity-60">
            Sync catalog
          </button>
        </div>
      </div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces" className={`${field} mt-6 sm:max-w-[320px]`} />
      {!loaded ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index} className="border border-[#e6dfd8] bg-white">
              <div className="piura-shimmer aspect-[3/4]" />
              <div className="px-4 py-4">
                <div className="piura-shimmer h-4 w-4/5" />
                <div className="piura-shimmer mt-3 h-3 w-2/5" />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {loaded && products.length === 0 ? (
        <div className="mt-6 border border-dashed border-olive/20 bg-white px-6 py-16 text-center">
          <p className="font-bebas text-[32px] text-olive">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-sm font-serif text-[15px] leading-6 text-body">Sync the catalog to copy the pieces already on the site. Edited products stay as they are.</p>
        </div>
      ) : loaded ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((product) => (
            <li key={product.slug}>
              <Link href={`/admin/products/${product.slug}`} className="group block border border-[#e6dfd8] bg-white">
                <span className="relative block aspect-[3/4] overflow-hidden bg-[#efeae4]">
                  <ShimmerImage src={product.src} alt="" className="size-full object-cover object-[center_18%] transition duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute top-2 left-2 flex flex-col items-start gap-1">
                    {product.preorder ? <span className="bg-olive px-2 py-1 font-bebas text-[12px] tracking-[0.08em] text-cream">Preorder</span> : null}
                    {product.hidden ? <span className="bg-white px-2 py-1 font-bebas text-[12px] tracking-[0.08em] text-olive">Hidden</span> : null}
                  </span>
                </span>
                <span className="block px-3 py-3 sm:px-4 sm:py-4">
                  <span className="block font-bebas text-[16px] leading-[1.05] tracking-[0.04em] text-ink uppercase sm:text-[18px]">{product.name}</span>
                  <span className="mt-2 block font-serif text-[13px] text-olive sm:text-[14px]">{productPriceLine(product) || "Coastlines pricing"}</span>
                  {product.gallery.length > 1 ? (
                    <span className="mt-3 flex gap-1">
                      {product.gallery.slice(0, 4).map((image) => (
                        <span key={image.src} className="relative h-11 w-8 overflow-hidden bg-[#efeae4]">
                          <ShimmerImage src={image.src} alt="" className="size-full object-cover object-[center_18%]" />
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {loaded && products.length > 0 && shown.length === 0 ? <p className="mt-6 font-serif text-[15px] text-body">No pieces match that search.</p> : null}
    </section>
  );
}
