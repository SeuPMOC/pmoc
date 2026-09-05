// Popula a conta de um usuário com 1 técnico + 5 estabelecimentos demo
// (ambientes, equipamentos com plano automático, algumas OS e 2 PMOCs com ART).
//
//   node --experimental-strip-types scripts/seed-demo.mjs dono@email.com
//
// Lê NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY de .env.local.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { planoPadraoParaTipo } from "../src/lib/pmoc/catalogo.ts";

// ---- env ----
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const email = process.argv[2];
if (!email) {
  console.error("uso: node --experimental-strip-types scripts/seed-demo.mjs <email-do-dono>");
  process.exit(1);
}

const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// ---- acha o org do usuário ----
const { data: prof } = await db
  .from("profiles")
  .select("org_id")
  .eq("email", email)
  .single();
if (!prof) {
  console.error(`Nenhum profile com email ${email}. Crie a conta primeiro em /login.`);
  process.exit(1);
}
const orgId = prof.org_id;
console.log("org:", orgId);

// ---- técnico ----
const { data: tec } = await db
  .from("technicians")
  .insert({
    org_id: orgId,
    nome: "Marina Alves",
    formacao: "Engenheira Mecânica",
    conselho: "CREA-MG",
    numero_registro: "145.207/D",
    art_numero: "BR2026 0000 0000",
  })
  .select("id")
  .single();

// ---- funcionários (equipe de campo) ----
const { data: func } = await db
  .from("employees")
  .insert([
    { org_id: orgId, nome: "Carlos Souza", cargo: "Técnico de refrigeração" },
    { org_id: orgId, nome: "Deivid Ramos", cargo: "Auxiliar técnico" },
  ])
  .select("id");

// ---- estabelecimentos ----
const ESTABS = [
  {
    razao_social: "Vida Plena Serviços Médicos Ltda",
    nome_fantasia: "Clínica Vida Plena",
    cnpj: "04.512.880/0001-33",
    endereco: "Av. do Contorno, 4820", bairro: "Funcionários",
    cidade: "Belo Horizonte", uf: "MG", cep: "30110-090",
    area_climatizada_m2: 840, populacao_fixa: 36, populacao_flutuante: 220,
    units: [
      ["Recepção", 45, 12, "atendimento"],
      ["Sala de espera", 90, 40, "espera"],
      ["Centro cirúrgico", 120, 8, "procedimento"],
      ["Ala de internação", 260, 24, "internação"],
    ],
    equip: [
      ["AC-01", "split_hi_wall", "Springer", "12.000 BTU/h", 12000, "Recepção"],
      ["AC-05", "self_agua", "Carrier", "10 TR", 120000, "Centro cirúrgico"],
      ["CH-01", "chiller_agua", "Trane", "40 TR", null, "Casa de máquinas"],
      ["TR-01", "torre_resfriamento", "Alpina", "45 TR", null, "Cobertura"],
      ["BAG-01", "bomba_agua_gelada", "KSB", "15 cv", null, "Casa de máquinas"],
      ["FC-01", "fancoil", "Trane", "5 TR", 60000, "Ala de internação"],
      ["QGBT-1", "qgbt", "WEG", "225 A", null, "Casa de máquinas"],
    ],
    pmoc: true,
  },
  {
    razao_social: "Comercial Boa Praça Ltda",
    nome_fantasia: "Supermercado Boa Praça",
    cnpj: "07.884.201/0001-10",
    endereco: "Av. João César de Oliveira, 1500", bairro: "Eldorado",
    cidade: "Contagem", uf: "MG", cep: "32310-000",
    area_climatizada_m2: 1200, populacao_fixa: 48, populacao_flutuante: 900,
    units: [
      ["Salão de vendas", 900, 250, "varejo"],
      ["Padaria", 80, 12, "produção"],
      ["Administrativo", 60, 10, "escritório"],
    ],
    equip: [
      ["SC-01", "self_ar", "Hitachi", "20 TR", 240000, "Salão de vendas"],
      ["SC-02", "self_ar", "Hitachi", "20 TR", 240000, "Salão de vendas"],
      ["CA-01", "cortina_ar", "Sicflux", "1,2 m", null, "Entrada principal"],
      ["EX-01", "exaustor", "Sicflux", "3.000 m³/h", null, "Padaria"],
      ["AC-10", "split_piso_teto", "LG", "36.000 BTU/h", 36000, "Administrativo"],
      ["QD-AC", "qd_ac", "Steck", "150 A", null, "Casa de máquinas"],
    ],
    pmoc: true,
  },
  {
    razao_social: "Sociedade Educacional Dom Bosco",
    nome_fantasia: "Colégio Dom Bosco",
    cnpj: "17.201.556/0001-92",
    endereco: "Rua Cláudio Manoel, 1162", bairro: "Savassi",
    cidade: "Belo Horizonte", uf: "MG", cep: "30140-100",
    area_climatizada_m2: 1600, populacao_fixa: 90, populacao_flutuante: 1200,
    units: [
      ["Biblioteca", 180, 60, "estudo"],
      ["Auditório", 300, 200, "eventos"],
      ["Laboratório de informática", 90, 30, "aula"],
      ["Salas de aula bloco B", 420, 240, "aula"],
    ],
    equip: [
      ["VRF-01", "vrf_vrv", "Daikin", "30 HP", null, "Cobertura bloco B"],
      ["AC-20", "split_cassete", "Fujitsu", "48.000 BTU/h", 48000, "Auditório"],
      ["AC-21", "split_cassete", "Fujitsu", "24.000 BTU/h", 24000, "Biblioteca"],
      ["VE-01", "ventilador_axial", "OTAM", "8.000 m³/h", null, "Ginásio"],
      ["PE-01", "pressurizacao_escada", "Projelmec", "12.000 m³/h", null, "Escada enclausurada"],
    ],
    pmoc: false,
  },
  {
    razao_social: "Marambaia Hotelaria Ltda",
    nome_fantasia: "Hotel Marambaia",
    cnpj: "21.664.930/0001-45",
    endereco: "Av. Raja Gabaglia, 3200", bairro: "Estoril",
    cidade: "Belo Horizonte", uf: "MG", cep: "30494-170",
    area_climatizada_m2: 2100, populacao_fixa: 40, populacao_flutuante: 300,
    units: [
      ["Lobby", 220, 60, "recepção"],
      ["Restaurante", 180, 90, "alimentação"],
      ["Apartamentos 3º andar", 600, 40, "hospedagem"],
      ["Lavanderia", 70, 6, "serviço"],
    ],
    equip: [
      ["MS-01", "multi_split", "Samsung", "8 evaporadoras", null, "Apartamentos 3º andar"],
      ["AC-30", "split_hi_wall", "Samsung", "18.000 BTU/h", 18000, "Lobby"],
      ["FC-10", "fancoil", "Hitecsa", "3 TR", 36000, "Restaurante"],
      ["BO-01", "boiler", "Bosch", "500 L", null, "Casa de máquinas"],
      ["BAQ-01", "bomba_agua_quente", "Schneider", "3 cv", null, "Casa de máquinas"],
      ["EX-10", "exaustao_cozinha", "Coifas MG", "4.500 m³/h", null, "Cozinha"],
    ],
    pmoc: false,
  },
  {
    razao_social: "Savassi Empreendimentos Imobiliários S/A",
    nome_fantasia: "Edifício Corporativo Savassi",
    cnpj: "33.918.005/0001-77",
    endereco: "Rua Pernambuco, 1000", bairro: "Savassi",
    cidade: "Belo Horizonte", uf: "MG", cep: "30130-151",
    area_climatizada_m2: 4200, populacao_fixa: 380, populacao_flutuante: 200,
    units: [
      ["Hall e elevadores", 160, 40, "circulação"],
      ["Pavimentos tipo 4º–12º", 3200, 320, "escritório"],
      ["Data center", 40, 4, "TI"],
      ["Auditório térreo", 240, 120, "eventos"],
    ],
    equip: [
      ["CH-10", "chiller_ar", "Carrier", "120 TR", null, "Cobertura"],
      ["CH-11", "chiller_ar", "Carrier", "120 TR", null, "Cobertura"],
      ["UTA-01", "uta_ahu", "Trox", "18.000 m³/h", null, "Casa de máquinas 4º"],
      ["FC-20", "fancoil", "Hitecsa", "4 TR", 48000, "Pavimentos tipo"],
      ["BAG-10", "bomba_agua_gelada", "KSB", "40 cv", null, "Casa de máquinas"],
      ["BAG-11", "bomba_agua_gelada", "KSB", "40 cv", null, "Casa de máquinas"],
      ["AC-DC", "self_ar", "Stulz", "15 TR", 180000, "Data center"],
      ["QGBT-C", "qgbt", "WEG", "630 A", null, "Subestação"],
      ["GER-01", "grupo_gerador", "Stemac", "250 kVA", null, "Casa de força"],
      ["NB-01", "nobreak", "APC", "80 kVA", null, "Data center"],
    ],
    pmoc: false,
  },
];

const hoje = new Date();
const iso = (d) => d.toISOString().slice(0, 10);

for (const e of ESTABS) {
  const { units, equip, pmoc, ...clientRow } = e;
  const { data: client } = await db
    .from("clients")
    .insert({ ...clientRow, org_id: orgId })
    .select("id")
    .single();

  const { data: unitRows } = await db
    .from("units")
    .insert(
      units.map(([nome, area_m2, ocupacao, finalidade]) => ({
        client_id: client.id, nome, area_m2, ocupacao, finalidade,
      })),
    )
    .select("id, nome");
  const unitByName = Object.fromEntries((unitRows ?? []).map((u) => [u.nome, u.id]));

  const equipSnap = [];
  for (const [tag, tipo, marca, cap, btu, local] of equip) {
    const { data: eq } = await db
      .from("equipment")
      .insert({
        client_id: client.id, tag, tipo, marca,
        modelo: cap, capacidade_btu: btu,
        unit_id: unitByName[local] ?? null,
        localizacao: local,
        fluido_refrigerante: btu ? "R-410A" : null,
      })
      .select("id")
      .single();

    const plano = planoPadraoParaTipo(tipo).map((a) => ({
      equipment_id: eq.id,
      atividade: a.atividade,
      periodicidade: a.periodicidade,
      norma_ref: a.norma_ref,
      responsavel: a.responsavel,
    }));
    if (plano.length) await db.from("maintenance_plan_items").insert(plano);

    // OS: algumas concluídas nos meses passados, próximas agendadas
    const { data: itens } = await db
      .from("maintenance_plan_items")
      .select("id, periodicidade")
      .eq("equipment_id", eq.id)
      .eq("periodicidade", "mensal")
      .limit(1);
    if (itens?.length) {
      for (let m = -3; m <= 2; m++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() + m, 5);
        await db.from("maintenance_orders").insert({
          org_id: orgId, client_id: client.id, equipment_id: eq.id,
          plan_item_id: itens[0].id, employee_id: func[Math.abs(m) % func.length]?.id,
          tipo: "preventiva",
          status: m < 0 ? "concluida" : "agendada",
          data_prevista: iso(d),
          data_execucao: m < 0 ? iso(d) : null,
          descricao_servico: m < 0 ? "Manutenção preventiva mensal executada." : null,
        });
      }
    }

    equipSnap.push({
      tag, tipo, marca, capacidadeBtu: btu ?? undefined,
      localizacao: local,
      plano: plano.map((p) => ({
        atividade: p.atividade, periodicidade: p.periodicidade,
        normaRef: p.norma_ref, responsavel: p.responsavel,
      })),
    });
  }

  if (pmoc) {
    const inicio = new Date(hoje.getFullYear(), 0, 1);
    const fim = new Date(hoje.getFullYear(), 11, 31);
    const snapshot = {
      emitidoEm: iso(hoje),
      periodo: { inicio: iso(inicio), fim: iso(fim) },
      mesInicio: 1,
      prestador: { nome: "Ar Puro Climatização ME" },
      estabelecimento: {
        razaoSocial: clientRow.razao_social,
        nomeFantasia: clientRow.nome_fantasia,
        cnpj: clientRow.cnpj,
        endereco: `${clientRow.endereco}, ${clientRow.bairro}`,
        cidade: clientRow.cidade, uf: clientRow.uf, cep: clientRow.cep,
        areaClimatizadaM2: clientRow.area_climatizada_m2,
        populacaoFixa: clientRow.populacao_fixa,
        populacaoFlutuante: clientRow.populacao_flutuante,
      },
      responsavelTecnico: {
        nome: "Marina Alves", formacao: "Engenheira Mecânica",
        conselho: "CREA-MG", numeroRegistro: "145.207/D",
        artNumero: "BR2026 0084 5512",
      },
      equipamentos: equipSnap,
      execucoes: [], qualidadeAr: [],
    };
    await db.from("pmoc_documents").insert({
      org_id: orgId, client_id: client.id, technician_id: tec.id,
      versao: 1, periodo_inicio: iso(inicio), periodo_fim: iso(fim),
      status: "emitido", dados_json: snapshot, emitido_em: new Date().toISOString(),
      art_numero: "BR2026 0084 5512", art_registrada_em: iso(hoje),
    });
  }

  console.log(`✓ ${clientRow.nome_fantasia} — ${units.length} ambientes, ${equip.length} equipamentos${pmoc ? " + PMOC" : ""}`);
}

console.log("\nSeed concluído. Abra /clientes.");
