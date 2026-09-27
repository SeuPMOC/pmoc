import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { PLANOS } from "@/lib/admin/planos";

export const metadata = {
  title: "SeuPMOC — PMOC pronto para cada cliente da sua empresa de climatização",
  description:
    "Cadastre estabelecimentos, ambientes e equipamentos e gere o PMOC em PDF com ART anexada e a planilha anual de manutenção. Conforme Lei 13.589/2018.",
};

// caminhos de ícones (24x24, traço) — sem dependência externa
const ICONS: Record<string, string> = {
  doc: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  fan: "M12 12a3 3 0 1 0 0 .01M12 9c0-4 1-6 3-6s2 3-3 6M15 12c4 0 6 1 6 3s-3 2-6-3M12 15c0 4-1 6-3 6s-2-3 3-6M9 12c-4 0-6-1-6-3s3-2 6 3",
  cal: "M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM3 10h18M8 2v4M16 2v4",
  check: "M9 12l2 2 4-4M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  wind: "M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8a3 3 0 1 1-3 3",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  lock: "M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4",
};

function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

const recursos = [
  ["doc", "PMOC em PDF", "Documento pronto, com base na Lei 13.589/2018 e na Portaria 3.523/98, com a ART anexada ao final."],
  ["grid", "Planilha de acompanhamento", "Tabela anual por equipamento (atividades × 12 meses), para deixar impressa no cliente."],
  ["fan", "61 tipos de equipamento", "Split, chiller, fancoil, torres, bombas, QGBT/QDG, CCM, gerador, BMS… cada um com plano padrão."],
  ["cal", "Cronograma automático", "Gera as ordens de serviço dos 12 meses e mostra o que está atrasado."],
  ["check", "Registro de execução", "Marque a manutenção feita e o funcionário responsável. Tudo entra no PMOC."],
  ["wind", "Laudos de qualidade do ar", "Registre os parâmetros medidos e mantenha o histórico do estabelecimento."],
  ["users", "Vários clientes, uma conta", "Gerencie todos os estabelecimentos atendidos pela sua empresa em um só lugar."],
  ["lock", "Dados protegidos (LGPD)", "Isolamento entre empresas, histórico de atividades, exportação e exclusão de dados."],
];

const passos = [
  ["Cadastre", "Estabelecimento, ambientes e equipamentos."],
  ["Gere", "PMOC em PDF com ART e a planilha de acompanhamento."],
  ["Acompanhe", "Cronograma anual e registro das manutenções."],
];

const publico = ["Hospitais e clínicas", "Shoppings", "Escolas", "Hotéis", "Condomínios comerciais", "Indústrias"];

// prévia da planilha (só visual)
const linhas: [string, number[]][] = [
  ["Split Hi-Wall · Recepção", [1, 0, 1, 0, 1, 0]],
  ["Fancoil · 2º andar", [1, 1, 1, 1, 1, 1]],
  ["Chiller · Casa de máquinas", [1, 0, 0, 1, 0, 0]],
  ["Bomba de água gelada", [1, 1, 0, 1, 1, 0]],
];

const brl = (n: number) => `R$ ${n}`;

export default async function Home() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // logado: a landing continua acessível e os botões levam ao sistema
  let entrada = "/login";
  if (user) {
    const { data: prof } = await supabase.from("profiles").select("role").single();
    entrada = prof?.role === "client" ? "/portal" : "/dashboard";
  }

  const planos = Object.entries(PLANOS);

  return (
    <div className="bg-white text-brand-dark">
      <header className="sticky top-0 z-20 border-b border-brand/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Image src="/logo.png" alt="SeuPMOC" width={640} height={220} priority className="h-11 w-auto" />
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="#recursos" className="hidden hover:text-brand md:inline">Recursos</a>
            <a href="#planos" className="hidden hover:text-brand md:inline">Planos</a>
            <Link href={entrada} className="hover:text-brand">{user ? "SeuPMOC" : "Entrar"}</Link>
            {!user && (            <Link href={entrada} className="rounded-lg bg-brand px-4 py-2 text-white shadow-sm transition hover:bg-brand-dark">
              Criar conta grátis
            </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-light via-white to-white">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                Conforme a Lei 13.589/2018
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                O PMOC de cada cliente seu,{" "}
                <span className="bg-gradient-to-r from-brand to-brand-green bg-clip-text text-transparent">
                  pronto em minutos
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Para empresas de climatização e manutenção predial: cadastre o estabelecimento,
                os ambientes e os equipamentos e gere o PMOC em PDF, com a ART anexada e a
                planilha anual de manutenção.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {!user && (                <Link href={entrada} className="rounded-lg bg-brand px-7 py-3.5 text-center font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark">
                  Começar grátis
                </Link>
                )}
                <a href="#recursos" className="rounded-lg border border-brand/30 bg-white px-7 py-3.5 text-center font-semibold text-brand transition hover:border-brand">
                  Ver o que faz
                </a>
              </div>
              {!user && <p className="mt-4 text-sm text-slate-500">Plano grátis, sem cartão de crédito.</p>}
            </div>

            {/* prévia da planilha */}
            <div className="relative">
              <div className="rounded-2xl border border-brand/15 bg-white p-4 shadow-2xl shadow-brand/15 sm:p-5 lg:rotate-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Planilha de acompanhamento</div>
                    <div className="font-bold">Clínica Vida Plena · 2026</div>
                  </div>
                  <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green">PMOC emitido</span>
                </div>
                <div className="mt-3 grid grid-cols-[1fr_repeat(6,1.6rem)] items-center gap-x-1 gap-y-2 text-xs">
                  <div />
                  {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"].map((m) => (
                    <div key={m} className="text-center font-semibold text-slate-400">{m}</div>
                  ))}
                  {linhas.map(([nome, meses]) => (
                    <div key={nome} className="contents">
                      <div className="truncate pr-2 font-medium">{nome}</div>
                      {meses.map((f, i) => (
                        <div key={i} className={`mx-auto h-5 w-5 rounded-md ${f ? "bg-brand" : "bg-brand-light"}`} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand" /> Prevista</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-light" /> Sem atividade</span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-brand/10 bg-white px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green"><Icon name="doc" className="h-5 w-5" /></span>
                  <div>
                    <div className="text-sm font-bold">PMOC + ART</div>
                    <div className="text-xs text-slate-500">PDF pronto para imprimir</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PÚBLICO */}
        <section className="border-y border-brand/10 bg-white py-8">
          <div className="mx-auto max-w-6xl px-5 text-center">
            <p className="text-sm font-medium text-slate-500">Para quem atende ambientes climatizados de uso coletivo</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {publico.map((p) => (
                <span key={p} className="rounded-full bg-brand-light px-4 py-1.5 text-sm font-medium text-brand">{p}</span>
              ))}
            </div>
          </div>
        </section>

        {/* RECURSOS */}
        <section id="recursos" className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Tudo o que o PMOC exige</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Do cadastro ao documento final, sem planilha manual e sem retrabalho.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recursos.map(([icone, t, d]) => (
              <div key={t} className="rounded-2xl border border-brand/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Icon name={icone} />
                </span>
                <h3 className="mt-4 font-bold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="bg-brand-dark py-20 text-white">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Como funciona</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {passos.map(([t, d], i) => (
                <div key={t} className="text-center md:text-left">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-green text-xl font-extrabold">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{t}</h3>
                  <p className="mt-2 text-white/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Planos</h2>
          <p className="mt-3 text-center text-slate-600">Cada cliente é um estabelecimento atendido pela sua empresa. Sem fidelidade.</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {planos.map(([key, p]) => {
              const destaque = key === "profissional";
              return (
                <div
                  key={key}
                  className={`relative flex flex-col rounded-2xl border p-6 ${
                    destaque ? "border-brand bg-white shadow-2xl shadow-brand/20 lg:-mt-3 lg:pb-9" : "border-brand/10 bg-white"
                  }`}
                >
                  {destaque && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-brand-green px-3 py-1 text-xs font-bold text-white">
                      Mais escolhido
                    </span>
                  )}
                  <div className="font-bold text-brand">{p.label}</div>
                  <div className="mt-2 text-4xl font-extrabold">
                    {brl(p.preco)}
                    <span className="text-sm font-medium text-slate-500">/mês</span>
                  </div>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                    {[
                      p.max_clientes ? `${p.max_clientes} ${p.max_clientes === 1 ? "cliente" : "clientes"}` : "Clientes ilimitados",
                      p.max_equipamentos ? `${p.max_equipamentos} equipamentos` : "Equipamentos ilimitados",
                      "PMOC + ART + planilha",
                    ].map((i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-brand-green">✓</span> {i}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={entrada}
                    className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                      destaque ? "bg-brand text-white hover:bg-brand-dark" : "border border-brand/30 text-brand hover:border-brand"
                    }`}
                  >
                    Começar
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
        {/* CTA */}
        {!user && (        <section className="px-5 pb-20">
          <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-14 text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Emita o primeiro PMOC hoje</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">Crie a conta grátis e cadastre seu primeiro cliente em poucos minutos.</p>
            <Link href={entrada} className="mt-8 inline-block rounded-lg bg-white px-8 py-3.5 font-semibold text-brand shadow-lg transition hover:bg-brand-light">
              Criar conta grátis
            </Link>
          </div>
        </section>
        )}
      </main>

      <footer className="border-t border-brand/10 bg-brand-light/40 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SeuPMOC · GCL Engenharia LTDA ·{" "}
        <Link href="/termos" className="hover:text-brand hover:underline">Termos</Link> ·{" "}
        <Link href="/privacidade" className="hover:text-brand hover:underline">Privacidade</Link> ·{" "}
        <Link href="/lgpd" className="hover:text-brand hover:underline">LGPD</Link>
      </footer>
    </div>
  );
}
