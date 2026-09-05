import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PLANOS, STATUS_LABEL, type PlanoKey } from "@/lib/admin/planos";
import { Crumb, Field, Panel, Submit } from "@/components/ui";
import { atualizarAssinatura, registrarMensalidade, marcarMensalidadePaga, marcarMensalidadeAtrasada } from "../actions";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PLANO_OPTS = Object.entries(PLANOS).map(([value, p]) => ({
  value,
  label: `${p.label} — ${brl(p.preco)}/mês`,
}));
const STATUS_OPTS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));

export default async function AdminOrgPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const admin = supabaseAdmin();

  const { data: org } = await admin.from("organizations").select("*").eq("id", orgId).single();
  if (!org) notFound();

  const [{ data: owners }, { data: clients }, { data: pagamentos }] = await Promise.all([
    admin.from("profiles").select("email, full_name").eq("org_id", orgId).eq("role", "owner"),
    admin.from("clients").select("id").eq("org_id", orgId),
    admin
      .from("subscription_payments")
      .select("*")
      .eq("org_id", orgId)
      .order("vencimento", { ascending: false }),
  ]);

  const clientIds = (clients ?? []).map((c) => c.id);
  const { data: equip } = await admin
    .from("equipment")
    .select("id")
    .in("client_id", clientIds.length ? clientIds : [""]);

  const plano = PLANOS[org.plano as PlanoKey];

  return (
    <div className="flex flex-col gap-6">
      <Crumb href="/admin">← Assinantes</Crumb>
      <h1 className="text-xl font-bold">{org.name}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Assinatura">
          <form action={atualizarAssinatura.bind(null, orgId)} className="grid gap-3">
            <Field label="Plano" name="plano" as="select" options={PLANO_OPTS} defaultValue={org.plano} />
            <Field
              label="Situação"
              name="assinatura_status"
              as="select"
              options={STATUS_OPTS}
              defaultValue={org.assinatura_status}
            />
            <Submit>Salvar</Submit>
          </form>
        </Panel>

        <Panel title="Uso atual">
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <b>{owners?.[0]?.email ?? "sem owner"}</b> — {owners?.[0]?.full_name ?? ""}
            </li>
            <li>
              {clients?.length ?? 0} cliente(s) de {plano?.max_clientes ?? "ilimitado"}
            </li>
            <li>
              {equip?.length ?? 0} equipamento(s) de {plano?.max_equipamentos ?? "ilimitado"}
            </li>
            <li className="text-neutral-500">
              conta criada em {new Date(org.created_at).toLocaleDateString("pt-BR")}
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Mensalidades">
        <ul className="mb-4 divide-y text-sm">
          {(pagamentos ?? []).map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2">
              <span>
                {p.competencia} · {brl(Number(p.valor))} · vence {p.vencimento}
                {p.observacao ? ` · ${p.observacao}` : ""}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className={
                    p.status === "pago"
                      ? "text-green-700"
                      : p.status === "atrasado"
                        ? "text-red-600"
                        : "text-neutral-500"
                  }
                >
                  {p.status}
                  {p.pago_em ? ` em ${p.pago_em}` : ""}
                </span>
                {p.status === "pendente" && (
                  <>
                    <form action={marcarMensalidadePaga.bind(null, orgId, p.id)}>
                      <button className="text-xs text-green-700 hover:underline">marcar pago</button>
                    </form>
                    <form action={marcarMensalidadeAtrasada.bind(null, orgId, p.id)}>
                      <button className="text-xs text-red-600 hover:underline">marcar atrasado</button>
                    </form>
                  </>
                )}
              </span>
            </li>
          ))}
          {!pagamentos?.length && (
            <li className="py-2 text-neutral-500">Nenhuma mensalidade registrada.</li>
          )}
        </ul>
        <form action={registrarMensalidade.bind(null, orgId)} className="grid gap-3 md:grid-cols-4">
          <Field label="Competência" name="competencia" placeholder="2026-09" required />
          <Field label="Valor (R$)" name="valor" type="number" step="0.01" defaultValue={plano?.preco} required />
          <Field label="Vencimento" name="vencimento" type="date" required />
          <Field label="Observação" name="observacao" placeholder="Pix, boleto..." />
          <div className="md:col-span-4">
            <Submit>Registrar mensalidade</Submit>
          </div>
        </form>
      </Panel>
    </div>
  );
}
