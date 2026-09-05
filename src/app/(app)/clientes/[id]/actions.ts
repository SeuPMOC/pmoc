"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, isStaff } from "@/lib/supabase/auth";
import { planoPadraoParaTipo } from "@/lib/pmoc/catalogo";
import { emitirPmoc } from "@/lib/pmoc/emitir";
import { mesesPrevistos } from "@/lib/pmoc/cronograma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checarLimiteEquipamentos } from "@/lib/pmoc/limites";

const str = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : String(v);
const num = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : Number(v);

async function staff() {
  const ctx = await requireUser();
  if (!isStaff(ctx.profile.role)) throw new Error("Sem permissão");
  return ctx;
}

const rev = (id: string) => revalidatePath(`/clientes/${id}`);

// ---------- Ambientes ----------
export async function criarUnidade(clientId: string, f: FormData) {
  const { supabase } = await staff();
  const { error } = await supabase.from("units").insert({
    client_id: clientId,
    nome: String(f.get("nome")),
    area_m2: num(f.get("area_m2")),
    ocupacao: num(f.get("ocupacao")),
    finalidade: str(f.get("finalidade")),
  });
  if (error) throw error;
  rev(clientId);
}

export async function excluirUnidade(clientId: string, unitId: string) {
  const { supabase } = await staff();
  const { error } = await supabase.from("units").delete().eq("id", unitId);
  if (error) throw error;
  rev(clientId);
}

// ---------- Equipamentos ----------
export async function criarEquipamento(clientId: string, f: FormData) {
  const { supabase, profile } = await staff();
  await checarLimiteEquipamentos(supabase, profile.org_id);
  const tipo = String(f.get("tipo"));
  const { data: equip, error } = await supabase
    .from("equipment")
    .insert({
      client_id: clientId,
      unit_id: str(f.get("unit_id")),
      tag: String(f.get("tag")),
      tipo,
      marca: str(f.get("marca")),
      modelo: str(f.get("modelo")),
      numero_serie: str(f.get("numero_serie")),
      capacidade_btu: num(f.get("capacidade_btu")),
      ano_fabricacao: num(f.get("ano_fabricacao")),
      fluido_refrigerante: str(f.get("fluido_refrigerante")),
      vazao_ar_exterior_m3h: num(f.get("vazao_ar_exterior_m3h")),
      localizacao: str(f.get("localizacao")),
      ambientes_atendidos: str(f.get("ambientes_atendidos")),
    })
    .select("id")
    .single();
  if (error) throw error;

  if (f.get("aplicar_plano")) {
    const plano = planoPadraoParaTipo(tipo).map((a) => ({
      equipment_id: equip.id,
      atividade: a.atividade,
      periodicidade: a.periodicidade,
      norma_ref: a.norma_ref,
      responsavel: a.responsavel,
    }));
    await supabase.from("maintenance_plan_items").insert(plano);
  }
  rev(clientId);
}

export async function aplicarPlanoPadrao(
  clientId: string,
  equipmentId: string,
  tipo: string,
) {
  const { supabase } = await staff();
  await supabase.from("maintenance_plan_items").delete().eq("equipment_id", equipmentId);
  const plano = planoPadraoParaTipo(tipo).map((a) => ({
    equipment_id: equipmentId,
    atividade: a.atividade,
    periodicidade: a.periodicidade,
    norma_ref: a.norma_ref,
    responsavel: a.responsavel,
  }));
  const { error } = await supabase.from("maintenance_plan_items").insert(plano);
  if (error) throw error;
  rev(clientId);
}

export async function excluirEquipamento(clientId: string, equipmentId: string) {
  const { supabase } = await staff();
  await supabase.from("equipment").delete().eq("id", equipmentId);
  rev(clientId);
}

// ---------- Ordens de serviço / execução ----------
export async function registrarExecucao(clientId: string, f: FormData) {
  const { supabase, profile } = await staff();
  const { error } = await supabase.from("maintenance_orders").insert({
    org_id: profile.org_id,
    client_id: clientId,
    equipment_id: str(f.get("equipment_id")),
    technician_id: str(f.get("technician_id")),
    tipo: String(f.get("tipo")),
    status: "concluida",
    data_prevista: str(f.get("data_prevista")),
    data_execucao: str(f.get("data_execucao")),
    descricao_servico: str(f.get("descricao_servico")),
    ocorrencias: str(f.get("ocorrencias")),
    pecas_substituidas: str(f.get("pecas_substituidas")),
    recomendacoes: str(f.get("recomendacoes")),
  });
  if (error) throw error;
  rev(clientId);
}

// ---------- Qualidade do ar ----------
export async function registrarLaudoAr(clientId: string, f: FormData) {
  const { supabase } = await staff();
  const t = num(f.get("temperatura_c"));
  const ur = num(f.get("umidade_rel"));
  const co2 = num(f.get("co2_ppm"));
  const fungos = num(f.get("contagem_fungica_ufc"));
  const dentro =
    (t == null || (t >= 23 && t <= 26)) &&
    (ur == null || (ur >= 40 && ur <= 65)) &&
    (co2 == null || co2 <= 1000) &&
    (fungos == null || fungos <= 750);

  const { error } = await supabase.from("air_quality_readings").insert({
    client_id: clientId,
    unit_id: str(f.get("unit_id")),
    data_medicao: String(f.get("data_medicao")),
    temperatura_c: t,
    umidade_rel: ur,
    co2_ppm: co2,
    velocidade_ar_ms: num(f.get("velocidade_ar_ms")),
    contagem_fungica_ufc: fungos,
    aerodispersoides: num(f.get("aerodispersoides")),
    dentro_padrao: dentro,
    observacoes: str(f.get("observacoes")),
  });
  if (error) throw error;
  rev(clientId);
}

// ---------- Cronograma: gerar ordens de serviço do período ----------
export async function gerarOrdensDoAno(clientId: string, f: FormData) {
  const { supabase, profile } = await staff();
  const inicioISO = String(f.get("inicio")); // yyyy-mm-dd
  const inicio = new Date(inicioISO);
  const mesInicio = inicio.getMonth() + 1;
  const anoInicio = inicio.getFullYear();

  const { data: equipamentos } = await supabase
    .from("equipment")
    .select("id, status, maintenance_plan_items(id, periodicidade)")
    .eq("client_id", clientId)
    .eq("status", "ativo");

  // OS já existentes p/ não duplicar (mesmo plan_item + data_prevista)
  const { data: existentes } = await supabase
    .from("maintenance_orders")
    .select("plan_item_id, data_prevista")
    .eq("client_id", clientId)
    .not("plan_item_id", "is", null);
  const jaTem = new Set(
    (existentes ?? []).map((o) => `${o.plan_item_id}|${o.data_prevista}`),
  );

  const novas: Record<string, unknown>[] = [];
  for (const e of equipamentos ?? []) {
    for (const item of e.maintenance_plan_items ?? []) {
      for (const mes of mesesPrevistos(item.periodicidade, mesInicio)) {
        // mês do cronograma vira data no calendário a partir do ano de início
        const ano = mes >= mesInicio ? anoInicio : anoInicio + 1;
        const data = `${ano}-${String(mes).padStart(2, "0")}-01`;
        const chave = `${item.id}|${data}`;
        if (jaTem.has(chave)) continue;
        jaTem.add(chave);
        novas.push({
          org_id: profile.org_id,
          client_id: clientId,
          equipment_id: e.id,
          plan_item_id: item.id,
          tipo: "preventiva",
          status: "agendada",
          data_prevista: data,
        });
      }
    }
  }

  if (novas.length) {
    const { error } = await supabase.from("maintenance_orders").insert(novas);
    if (error) throw error;
  }
  rev(clientId);
  revalidatePath(`/clientes/${clientId}/cronograma`);
}

// ---------- ART do PMOC ----------
export async function anexarArt(clientId: string, pmocId: string, f: FormData) {
  const { supabase } = await staff();

  const { data: pmoc } = await supabase
    .from("pmoc_documents")
    .select("id, org_id")
    .eq("id", pmocId)
    .single();
  if (!pmoc) throw new Error("PMOC não encontrado");

  const file = f.get("art_file") as File | null;
  let art_path: string | undefined;

  if (file && file.size > 0) {
    if (file.type !== "application/pdf") throw new Error("A ART deve ser um arquivo PDF.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Arquivo acima de 10 MB.");
    art_path = `${pmoc.org_id}/${pmocId}.pdf`;
    const { error } = await supabaseAdmin()
      .storage.from("art")
      .upload(art_path, file, { upsert: true, contentType: "application/pdf" });
    if (error) throw error;
  }

  const { error } = await supabase
    .from("pmoc_documents")
    .update({
      art_numero: str(f.get("art_numero")),
      art_registrada_em: str(f.get("art_registrada_em")),
      ...(art_path ? { art_path } : {}),
    })
    .eq("id", pmocId);
  if (error) throw error;
  rev(clientId);
}

// ---------- Emitir PMOC ----------
export async function emitir(clientId: string, f: FormData) {
  await staff();
  const id = await emitirPmoc({
    clientId,
    periodoInicio: String(f.get("periodo_inicio")),
    periodoFim: String(f.get("periodo_fim")),
    technicianId: str(f.get("technician_id")) ?? undefined,
  });
  redirect(`/api/pmoc/${id}/pdf`);
}
