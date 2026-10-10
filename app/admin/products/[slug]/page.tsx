import { AdminProductForm } from "@/components/admin-product-form";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AdminProductForm slug={slug} />;
}
