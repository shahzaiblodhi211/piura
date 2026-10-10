import { AdminCreatorForm } from "@/components/admin-creator-form";

export default async function EditCreatorPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <AdminCreatorForm code={code} />;
}
