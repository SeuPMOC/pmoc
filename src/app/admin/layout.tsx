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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand/10 bg-white/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-6">
          <span className="font-bold">SeuPMOC · admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="rounded-lg px-3 py-1.5 text-neutral-600 transition hover:bg-brand-light hover:text-brand">
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
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
