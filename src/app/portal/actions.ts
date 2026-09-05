"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/supabase/auth";
import { planoPadraoParaTipo } from "@/lib/pmoc/catalogo";

const str = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : String(v);
const num = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : Number(v);

// ---------- Estabelecimento ----------
export async function salvarEstabelecimento(f: FormData) {
  const { supabase, clientId } = await requireClient();
  const { error } = await supabase
    .from("clients")
    .update({
      razao_social: String(f.get("razao_social")),
      nome_fantasia: str(f.get("nome_fantasia")),
      cnpj: str(f.get("cnpj")),
      endereco: str(f.get("endereco")),
      numero: str(f.get("numero")),
      bairro: str(f.get("bairro")),
      cidade: str(f.get("cidade")),
      uf: str(f.get("uf")),
      cep: str(f.get("cep")),
      contato_nome: str(f.get("contato_nome")),
      contato_email: str(f.get("contato_email")),
      contato_fone: str(f.get("contato_fone")),
      area_climatizada_m2: num(f.get("area_climatizada_m2")),
      populacao_fixa: num(f.get("populacao_fixa")),
      populacao_flutuante: num(f.get("populacao_flutuante")),
    })
    .eq("id", clientId);
  if (error) throw error;
  revalidatePath("/portal/estabelecimento");
  revalidatePath("/portal");
}

// ---------- Ambientes ----------
export async function criarAmbiente(f: FormData) {
  const { supabase, clientId } = await requireClient();
  const { error } = await supabase.from("units").insert({
    client_id: clientId,
    nome: String(f.get("nome")),
    area_m2: num(f.get("area_m2")),
    ocupacao: num(f.get("ocupacao")),
    finalidade: str(f.get("finalidade")),
  });
  if (error) throw error;
  revalidatePath("/portal/ambientes");
  revalidatePath("/portal");
}

export async function excluirAmbiente(id: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("units").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath("/portal/ambientes");
  revalidatePath("/portal");
}

// ---------- Equipamentos ----------
export async function criarEquipamento(f: FormData) {
  const { supabase, clientId } = await requireClient();
  const tipo = String(f.get("tipo"));
  const { data: eq, error } = await supabase
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

  // aplica automaticamente o plano padrão da norma para o tipo
  const plano = planoPadraoParaTipo(tipo).map((a) => ({
    equipment_id: eq.id,
    atividade: a.atividade,
    periodicidade: a.periodicidade,
    norma_ref: a.norma_ref,
    responsavel: a.responsavel,
  }));
  await supabase.from("maintenance_plan_items").insert(plano);

  revalidatePath("/portal/equipamentos");
  revalidatePath("/portal");
}

export async function excluirEquipamento(id: string) {
  const { supabase } = await requireClient();
  const { error } = await supabase.from("equipment").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath("/portal/equipamentos");
  revalidatePath("/portal");
}
