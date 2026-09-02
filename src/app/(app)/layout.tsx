import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

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
  ];

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold">PMOC</span>
          <nav className="flex gap-4 text-sm">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="text-neutral-600 hover:text-black">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="text-sm text-neutral-500">
          {/* @ts-expect-error relação aninhada */}
          {prof?.organizations?.name} · {prof?.full_name ?? user.email}
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
