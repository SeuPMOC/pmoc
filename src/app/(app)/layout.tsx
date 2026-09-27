import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { BotaoSair } from "@/components/botao-sair";
import { isPlatformAdmin } from "@/lib/supabase/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/confirme-email");

  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name, role, organizations(name)")
    .single();

  if (prof?.role === "client") redirect("/portal");

  const nav = [
    ["Painel", "/dashboard"],
    ["Clientes", "/clientes"],
    ["Cobrança", "/cobranca"],
    ["Minha empresa", "/empresa"],
    ...(isPlatformAdmin(user.email) ? [["Painel admin", "/admin"]] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand/10 bg-white/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-6">
          <Image src="/logo.png" alt="SeuPMOC" width={640} height={220} className="h-8 w-auto" />
          <nav className="flex gap-1 text-sm font-medium">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-lg px-3 py-1.5 text-neutral-600 transition hover:bg-brand-light hover:text-brand">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span>
            {(prof?.organizations as { name?: string } | null)?.name} ·{" "}
            {prof?.full_name ?? user.email}
          </span>
          <BotaoSair />
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
