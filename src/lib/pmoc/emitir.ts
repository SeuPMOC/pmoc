import { supabaseServer } from "@/lib/supabase/server";
import type { PmocSnapshot } from "./tipos";

const br = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "";

// Monta o snapshot do PMOC de um cliente para um período e grava em pmoc_documents.
export async function emitirPmoc(opts: {
  clientId: string;
  periodoInicio: string; // ISO
  periodoFim: string;
  technicianId?: string;
}) {
  const supabase = await supabaseServer();

  const { data: prof } = await supabase
    .from("profiles")
    .select("org_id")
    .single();
  if (!prof) throw new Error("Sem organização");

  const [{ data: org }, { data: client }, { data: tech }, { data: equipamentos }, { data: execucoes }, { data: ar }] =
    await Promise.all([
      supabase.from("organizations").select("*").eq("id", prof.org_id).single(),
      supabase.from("clients").select("*").eq("id", opts.clientId).single(),
      opts.technicianId
        ? supabase.from("technicians").select("*").eq("id", opts.technicianId).single()
        : Promise.resolve({ data: null }),
      supabase
        .from("equipment")
        .select("*, maintenance_plan_items(*)")
        .eq("client_id", opts.clientId),
      supabase
        .from("maintenance_orders")
        .select("*, equipment(tag), employees(nome)")
        .eq("client_id", opts.clientId)
        .gte("data_execucao", opts.periodoInicio)
        .lte("data_execucao", opts.periodoFim)
        .order("data_execucao"),
      supabase
        .from("air_quality_readings")
        .select("*, units(nome)")
        .eq("client_id", opts.clientId)
        .gte("data_medicao", opts.periodoInicio)
        .lte("data_medicao", opts.periodoFim),
    ]);

  if (!client) throw new Error("Cliente não encontrado");

  const snapshot: PmocSnapshot = {
    emitidoEm: new Date().toLocaleDateString("pt-BR"),
    periodo: { inicio: br(opts.periodoInicio), fim: br(opts.periodoFim) },
    mesInicio: new Date(opts.periodoInicio).getMonth() + 1,
    prestador: {
      nome: org?.name ?? "",
      cnpj: org?.cnpj ?? undefined,
      telefone: org?.telefone ?? undefined,
      email: org?.email ?? undefined,
    },
    estabelecimento: {
      razaoSocial: client.razao_social,
      nomeFantasia: client.nome_fantasia ?? undefined,
      cnpj: client.cnpj ?? undefined,
      endereco: [client.endereco, client.numero, client.bairro]
        .filter(Boolean)
        .join(", "),
      cidade: client.cidade ?? undefined,
      uf: client.uf ?? undefined,
      cep: client.cep ?? undefined,
      areaClimatizadaM2: client.area_climatizada_m2 ?? undefined,
      populacaoFixa: client.populacao_fixa ?? undefined,
      populacaoFlutuante: client.populacao_flutuante ?? undefined,
    },
    responsavelTecnico: tech
      ? {
          nome: tech.nome,
          formacao: tech.formacao ?? undefined,
          conselho: tech.conselho ?? undefined,
          numeroRegistro: tech.numero_registro ?? undefined,
          artNumero: tech.art_numero ?? undefined,
        }
      : undefined,
    equipamentos: (equipamentos ?? []).map((e) => ({
      tag: e.tag,
      tipo: e.tipo,
      marca: e.marca ?? undefined,
      modelo: e.modelo ?? undefined,
      capacidadeBtu: e.capacidade_btu ?? undefined,
      fluido: e.fluido_refrigerante ?? undefined,
      vazaoArExteriorM3h: e.vazao_ar_exterior_m3h ?? undefined,
      localizacao: e.localizacao ?? undefined,
      ambientesAtendidos: e.ambientes_atendidos ?? undefined,
      plano: (e.maintenance_plan_items ?? []).map((p: Record<string, unknown>) => ({
        atividade: p.atividade as string,
        periodicidade: p.periodicidade as string,
        normaRef: (p.norma_ref as string) ?? undefined,
        responsavel: (p.responsavel as string) ?? undefined,
      })),
    })),
    execucoes: (execucoes ?? []).map((x) => ({
      data: br(x.data_execucao),
      equipamentoTag: x.equipment?.tag ?? undefined,
      tipo: x.tipo,
      responsavel: x.employees?.nome ?? undefined,
      descricao: x.descricao_servico ?? undefined,
      ocorrencias: x.ocorrencias ?? undefined,
    })),
    qualidadeAr: (ar ?? []).map((q) => ({
      dataMedicao: br(q.data_medicao),
      ambiente: q.units?.nome ?? undefined,
      temperaturaC: q.temperatura_c ?? undefined,
      umidadeRel: q.umidade_rel ?? undefined,
      co2Ppm: q.co2_ppm ?? undefined,
      contagemFungicaUfc: q.contagem_fungica_ufc ?? undefined,
      dentroPadrao: q.dentro_padrao ?? undefined,
    })),
  };

  const { data: last } = await supabase
    .from("pmoc_documents")
    .select("versao")
    .eq("client_id", opts.clientId)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from("pmoc_documents")
    .insert({
      org_id: prof.org_id,
      client_id: opts.clientId,
      technician_id: opts.technicianId ?? null,
      versao: (last?.versao ?? 0) + 1,
      periodo_inicio: opts.periodoInicio,
      periodo_fim: opts.periodoFim,
      status: "emitido",
      dados_json: snapshot,
      emitido_em: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id as string;
}
