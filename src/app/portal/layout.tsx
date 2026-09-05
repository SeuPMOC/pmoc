import Link from "next/link";
import { requireClient } from "@/lib/supabase/auth";

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
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold">Portal SeuPMOC</span>
          <nav className="flex gap-4 text-sm">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="text-neutral-600 hover:text-black">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="text-sm text-neutral-500">
          {client?.razao_social} · {user.email}
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
