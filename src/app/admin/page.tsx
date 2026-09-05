import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PLANOS, STATUS_LABEL, type PlanoKey } from "@/lib/admin/planos";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function AdminHome() {
  const admin = supabaseAdmin();

  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, email, plano, assinatura_status, trial_termina_em, created_at")
    .order("created_at", { ascending: false });

  const orgIds = (orgs ?? []).map((o) => o.id);

  const [{ data: owners }, { data: clients }, { data: pagamentos }] = await Promise.all([
    admin.from("profiles").select("org_id, email, full_name").eq("role", "owner").in("org_id", orgIds.length ? orgIds : [""]),
    admin.from("clients").select("id, org_id").in("org_id", orgIds.length ? orgIds : [""]),
    admin
      .from("subscription_payments")
      .select("org_id, valor, vencimento, status")
      .in("org_id", orgIds.length ? orgIds : [""])
      .order("vencimento", { ascending: false }),
  ]);

  const clientIds = (clients ?? []).map((c) => c.id);
  const { data: equip } = await admin
    .from("equipment")
    .select("client_id")
    .in("client_id", clientIds.length ? clientIds : [""]);

  const clientCountByOrg = new Map<string, number>();
  for (const c of clients ?? [])
    clientCountByOrg.set(c.org_id, (clientCountByOrg.get(c.org_id) ?? 0) + 1);

  const orgByClientId = new Map((clients ?? []).map((c) => [c.id, c.org_id]));
  const equipCountByOrg = new Map<string, number>();
  for (const e of equip ?? []) {
    const orgId = orgByClientId.get(e.client_id);
    if (orgId) equipCountByOrg.set(orgId, (equipCountByOrg.get(orgId) ?? 0) + 1);
  }

  const ownerByOrg = new Map((owners ?? []).map((o) => [o.org_id, o]));
  const nextPaymentByOrg = new Map<string, { valor: number; vencimento: string; status: string }>();
  for (const p of pagamentos ?? []) {
    if (!nextPaymentByOrg.has(p.org_id)) nextPaymentByOrg.set(p.org_id, p);
  }

  const mrr = (orgs ?? [])
    .filter((o) => o.assinatura_status === "ativa")
    .reduce((s, o) => s + (PLANOS[o.plano as PlanoKey]?.preco ?? 0), 0);
  const inadimplentes = (orgs ?? []).filter(
    (o) => o.assinatura_status === "atrasada" || nextPaymentByOrg.get(o.id)?.status === "atrasado",
  ).length;
  const emTeste = (orgs ?? []).filter((o) => o.assinatura_status === "trial").length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Assinantes do SeuPMOC</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-neutral-500">Assinantes</div>
          <div className="mt-1 text-2xl font-bold">{orgs?.length ?? 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-neutral-500">MRR (ativos)</div>
          <div className="mt-1 text-2xl font-bold text-green-700">{brl(mrr)}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-neutral-500">Em teste</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{emTeste}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-neutral-500">Inadimplentes</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{inadimplentes}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-neutral-500">
            <tr>
              <th className="p-3">Empresa</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Situação</th>
              <th className="p-3">Uso</th>
              <th className="p-3">Próxima mensalidade</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(orgs ?? []).map((o) => {
              const owner = ownerByOrg.get(o.id);
              const plano = PLANOS[o.plano as PlanoKey];
              const pg = nextPaymentByOrg.get(o.id);
              const nClientes = clientCountByOrg.get(o.id) ?? 0;
              const nEquip = equipCountByOrg.get(o.id) ?? 0;
              return (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{o.name}</td>
                  <td className="p-3 text-neutral-500">{owner?.email ?? o.email ?? "—"}</td>
                  <td className="p-3">{plano?.label ?? o.plano}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        o.assinatura_status === "ativa"
                          ? "bg-green-50 text-green-700"
                          : o.assinatura_status === "trial"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {STATUS_LABEL[o.assinatura_status] ?? o.assinatura_status}
                    </span>
                    {o.assinatura_status === "trial" && o.trial_termina_em && (
                      <div className="mt-0.5 text-[11px] text-neutral-400">
                        até {o.trial_termina_em}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-neutral-500">
                    {nClientes}/{plano?.max_clientes ?? "∞"} clientes ·{" "}
                    {nEquip}/{plano?.max_equipamentos ?? "∞"} equip.
                  </td>
                  <td className="p-3">
                    {pg ? (
                      <span
                        className={
                          pg.status === "pago"
                            ? "text-green-700"
                            : pg.status === "atrasado"
                              ? "text-red-600"
                              : "text-neutral-600"
                        }
                      >
                        {brl(Number(pg.valor))} · {pg.vencimento} · {pg.status}
                      </span>
                    ) : (
                      <span className="text-neutral-400">sem registro</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/${o.id}`} className="text-blue-600 hover:underline">
                      ver
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!orgs?.length && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-neutral-500">
                  Nenhum assinante ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
