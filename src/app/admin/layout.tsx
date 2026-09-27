import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/supabase/auth";
import { BotaoSair } from "@/components/botao-sair";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold">SeuPMOC · admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="text-neutral-600 hover:text-black">
              Assinantes
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-neutral-500 hover:underline">
            ← voltar pro app
          </Link>
          <BotaoSair />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
