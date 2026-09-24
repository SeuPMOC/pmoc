import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { PLANOS } from "@/lib/admin/planos";

export const metadata = {
  title: "SeuPMOC — PMOC pronto para cada cliente da sua empresa de climatização",
  description:
    "Cadastre estabelecimentos, ambientes e equipamentos e gere o PMOC em PDF com ART anexada e a planilha anual de manutenção. Conforme Lei 13.589/2018.",
};

const recursos = [
  ["PMOC em PDF", "Documento pronto, baseado na Lei 13.589/2018 e na Portaria 3.523/98, com a ART anexada ao final."],
  ["Planilha de acompanhamento", "Tabela anual por equipamento (atividades × 12 meses) para deixar impressa no cliente."],
  ["61 tipos de equipamento", "Split, chiller, fancoil, torres, bombas, QGBT/QDG, CCM, gerador, BMS… cada um com plano de manutenção padrão."],
  ["Cronograma automático", "Gera as ordens de serviço dos 12 meses e mostra o que está atrasado."],
  ["Registro de execução", "Marque a manutenção feita e o funcionário responsável. Tudo entra no PMOC."],
  ["Laudos de qualidade do ar", "Registre os parâmetros medidos e mantenha o histórico do estabelecimento."],
  ["Vários clientes, uma conta", "Gerencie todos os estabelecimentos atendidos pela sua empresa em um só lugar."],
  ["Dados protegidos (LGPD)", "Isolamento total entre empresas, histórico de atividades, exportação e exclusão de dados."],
];

const passos = [
  ["Cadastre", "Estabelecimento, ambientes e equipamentos."],
  ["Gere", "PMOC em PDF com ART e planilha de acompanhamento."],
  ["Acompanhe", "Cronograma anual e registro das manutenções."],
];

const brl = (n: number) => (n === 0 ? "Grátis" : `R$ ${n}`);

export default async function Home() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: prof } = await supabase.from("profiles").select("role").single();
    redirect(prof?.role === "client" ? "/portal" : "/dashboard");
  }

  return (
    <div className="text-neutral-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <span className="text-lg font-bold">SeuPMOC</span>
        <nav className="flex items-center gap-5 text-sm">
          <a href="#planos" className="hidden sm:inline hover:underline">Planos</a>
          <Link href="/login" className="hover:underline">Entrar</Link>
          <Link href="/login" className="rounded bg-black px-4 py-2 font-medium text-white">
            Criar conta grátis
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:py-24">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            O PMOC de cada cliente seu, pronto e em conformidade
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
            Para empresas de climatização e manutenção predial: cadastre o estabelecimento,
            os ambientes e os equipamentos, e gere o PMOC em PDF com a ART anexada e a
            planilha anual de manutenção. Sem planilha manual e sem retrabalho.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="rounded bg-black px-6 py-3 font-medium text-white">
              Começar grátis
            </Link>
            <a href="#recursos" className="rounded border border-neutral-300 px-6 py-3 font-medium">
              Ver o que faz
            </a>
          </div>
          <p className="mt-3 text-sm text-neutral-500">Plano grátis sem cartão de crédito.</p>
        </section>

        <section className="bg-neutral-50 py-14">
          <div className="mx-auto grid max-w-5xl gap-6 px-5 sm:grid-cols-3">
            {passos.map(([t, d], i) => (
              <div key={t}>
                <div className="text-sm font-semibold text-neutral-500">Passo {i + 1}</div>
                <div className="text-xl font-bold">{t}</div>
                <p className="mt-1 text-neutral-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-center text-3xl font-bold">Tudo o que o PMOC exige</h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {recursos.map(([t, d]) => (
              <div key={t}>
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-neutral-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="bg-neutral-50 py-16">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-center text-3xl font-bold">Planos</h2>
            <p className="mt-2 text-center text-neutral-600">
              Cada cliente é um estabelecimento atendido pela sua empresa.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.values(PLANOS).map((p) => (
                <div key={p.label} className="rounded-lg border border-neutral-200 bg-white p-5">
                  <div className="font-semibold">{p.label}</div>
                  <div className="mt-2 text-3xl font-bold">
                    {brl(p.preco)}
                    {p.preco > 0 && <span className="text-sm font-normal text-neutral-500">/mês</span>}
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-neutral-600">
                    <li>{p.max_clientes ?? "Clientes ilimitados"}{p.max_clientes ? " cliente(s)" : ""}</li>
                    <li>{p.max_equipamentos ?? "Equipamentos ilimitados"}{p.max_equipamentos ? " equipamentos" : ""}</li>
                    <li>PMOC + ART + planilha</li>
                  </ul>
                  <Link href="/login" className="mt-5 block rounded bg-black py-2 text-center text-sm font-medium text-white">
                    Começar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 text-center">
          <h2 className="text-3xl font-bold">Emita o primeiro PMOC hoje</h2>
          <Link href="/login" className="mt-6 inline-block rounded bg-black px-6 py-3 font-medium text-white">
            Criar conta grátis
          </Link>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} SeuPMOC ·{" "}
        <Link href="/termos" className="hover:underline">Termos</Link> ·{" "}
        <Link href="/privacidade" className="hover:underline">Privacidade</Link>
      </footer>
    </div>
  );
}
