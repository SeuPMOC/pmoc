import Link from "next/link";
import { requireClient } from "@/lib/supabase/auth";
import { BotaoSair } from "@/components/botao-sair";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user, clientId } = await requireClient();
  const { data: client } = await supabase
    .from("clients")
    .select("razao_social, organizations(name)")
    .eq("id", clientId)
    .single();

  const nav = [
    ["Início", "/portal"],
    ["Estabelecimento", "/portal/estabelecimento"],
    ["Ambientes", "/portal/ambientes"],
    ["Equipamentos", "/portal/equipamentos"],
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-brand/10 bg-white/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-6">
          <span className="font-bold">Portal SeuPMOC</span>
          <nav className="flex gap-4 text-sm">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-lg px-3 py-1.5 text-neutral-600 transition hover:bg-brand-light hover:text-brand">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span>{client?.razao_social} · {user.email}</span>
          <BotaoSair />
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
