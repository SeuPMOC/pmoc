// Catálogo de referência PMOC — base legal:
// Lei 13.589/2018, Portaria MS 3.523/1998 (art. 5º), ABNT NBR 13971, NBR 16401-3,
// NBR 14679 e 14518 (higienização), NBR 14880 (pressurização), NBR 5410 / NR-10
// (instalações elétricas), NR-13 (caldeiras/vasos), RE ANVISA 09/2003 (qualidade do ar).

export type Periodicidade =
  | "semanal"
  | "mensal"
  | "bimestral"
  | "trimestral"
  | "semestral"
  | "anual"
  | "eventual";

export const PERIODICIDADE_MESES: Record<Periodicidade, number> = {
  semanal: 0.25,
  mensal: 1,
  bimestral: 2,
  trimestral: 3,
  semestral: 6,
  anual: 12,
  eventual: 0,
};

export interface AtividadePadrao {
  atividade: string;
  periodicidade: Periodicidade;
  norma_ref: string;
  responsavel: "Técnico" | "Operador";
  aplicaA?: string[]; // chaves de tipo; ausente = todo equipamento que "trata ar"
}

// ---------------------------------------------------------------------------
// Tipos de equipamento — o mais abrangente possível para um PMOC de sistema
// central. `trataAr` = recebe também o plano mínimo da Portaria 3.523/98.
// ---------------------------------------------------------------------------
export const CATEGORIAS = [
  "Expansão direta (DX)",
  "Água gelada",
  "Rejeição de calor",
  "Bombas",
  "Ventilação e exaustão",
  "Tratamento e distribuição de ar",
  "Aquecimento",
  "Hidráulica AVAC",
  "Elétrica e controle",
  "Suprimento e apoio",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export interface TipoEquipamento {
  value: string;
  label: string;
  group: Categoria;
  trataAr: boolean;
}

export const EQUIP_TIPOS: TipoEquipamento[] = [
  // --- Expansão direta (DX) ---
  { value: "split_hi_wall", label: "Split hi-wall (parede)", group: "Expansão direta (DX)", trataAr: true },
  { value: "split_piso_teto", label: "Split piso-teto", group: "Expansão direta (DX)", trataAr: true },
  { value: "split_cassete", label: "Split cassete", group: "Expansão direta (DX)", trataAr: true },
  { value: "split_duto", label: "Split duto / built-in", group: "Expansão direta (DX)", trataAr: true },
  { value: "multi_split", label: "Multi split", group: "Expansão direta (DX)", trataAr: true },
  { value: "vrf_vrv", label: "VRF / VRV", group: "Expansão direta (DX)", trataAr: true },
  { value: "janela", label: "Condicionador de janela (ACJ)", group: "Expansão direta (DX)", trataAr: true },
  { value: "self_ar", label: "Self-contained (condensação a ar)", group: "Expansão direta (DX)", trataAr: true },
  { value: "self_agua", label: "Self-contained (condensação a água)", group: "Expansão direta (DX)", trataAr: true },
  { value: "rooftop", label: "Rooftop (compacto de cobertura)", group: "Expansão direta (DX)", trataAr: true },
  { value: "ptac", label: "PTAC (pacote terminal)", group: "Expansão direta (DX)", trataAr: true },
  { value: "portatil", label: "Condicionador portátil", group: "Expansão direta (DX)", trataAr: true },
  { value: "bomba_calor_ar", label: "Bomba de calor ar-ar", group: "Expansão direta (DX)", trataAr: true },

  // --- Água gelada ---
  { value: "chiller_ar", label: "Chiller (condensação a ar)", group: "Água gelada", trataAr: false },
  { value: "chiller_agua", label: "Chiller (condensação a água)", group: "Água gelada", trataAr: false },
  { value: "fancoil", label: "Fancoil", group: "Água gelada", trataAr: true },
  { value: "fancolete", label: "Fancolete / cassete de água", group: "Água gelada", trataAr: true },
  { value: "uta_ahu", label: "UTA / climatizador (AHU)", group: "Água gelada", trataAr: true },
  { value: "self_agua_gelada", label: "Self de água gelada", group: "Água gelada", trataAr: true },

  // --- Rejeição de calor ---
  { value: "torre_resfriamento", label: "Torre de resfriamento", group: "Rejeição de calor", trataAr: false },
  { value: "condensador_remoto", label: "Condensador remoto (a ar)", group: "Rejeição de calor", trataAr: false },
  { value: "dry_cooler", label: "Dry cooler / resfriador seco", group: "Rejeição de calor", trataAr: false },

  // --- Bombas ---
  { value: "bomba_agua_gelada", label: "Bomba de água gelada", group: "Bombas", trataAr: false },
  { value: "bomba_condensacao", label: "Bomba de água de condensação", group: "Bombas", trataAr: false },
  { value: "bomba_agua_quente", label: "Bomba de água quente", group: "Bombas", trataAr: false },
  { value: "bomba_dreno", label: "Bomba de dreno / recalque de condensado", group: "Bombas", trataAr: false },
  { value: "bomba_dosadora", label: "Bomba dosadora (tratamento de água)", group: "Bombas", trataAr: false },

  // --- Ventilação e exaustão ---
  { value: "ventilador_axial", label: "Ventilador axial", group: "Ventilação e exaustão", trataAr: true },
  { value: "ventilador_centrifugo", label: "Ventilador centrífugo", group: "Ventilação e exaustão", trataAr: true },
  { value: "exaustor", label: "Exaustor", group: "Ventilação e exaustão", trataAr: true },
  { value: "caixa_ventilacao", label: "Caixa de ventilação", group: "Ventilação e exaustão", trataAr: true },
  { value: "cortina_ar", label: "Cortina de ar", group: "Ventilação e exaustão", trataAr: true },
  { value: "exaustao_cozinha", label: "Exaustão de cozinha / coifa", group: "Ventilação e exaustão", trataAr: false },
  { value: "pressurizacao_escada", label: "Pressurização de escada", group: "Ventilação e exaustão", trataAr: false },
  { value: "caixa_vav", label: "Caixa VAV", group: "Ventilação e exaustão", trataAr: true },

  // --- Tratamento e distribuição de ar ---
  { value: "caixa_filtragem", label: "Caixa de filtragem / filtro de ar", group: "Tratamento e distribuição de ar", trataAr: false },
  { value: "filtro_absoluto", label: "Filtro absoluto (HEPA)", group: "Tratamento e distribuição de ar", trataAr: false },
  { value: "umidificador", label: "Umidificador", group: "Tratamento e distribuição de ar", trataAr: false },
  { value: "desumidificador", label: "Desumidificador", group: "Tratamento e distribuição de ar", trataAr: true },
  { value: "lavador_ar", label: "Lavador de ar (air washer)", group: "Tratamento e distribuição de ar", trataAr: false },
  { value: "rede_dutos", label: "Rede de dutos", group: "Tratamento e distribuição de ar", trataAr: false },
  { value: "difusores_grelhas", label: "Difusores, grelhas e venezianas", group: "Tratamento e distribuição de ar", trataAr: false },
  { value: "damper", label: "Damper (corta-fogo / regulagem)", group: "Tratamento e distribuição de ar", trataAr: false },

  // --- Aquecimento ---
  { value: "bateria_aquecimento", label: "Bateria de aquecimento (elétrica / água quente)", group: "Aquecimento", trataAr: false },
  { value: "boiler", label: "Boiler / aquecedor de acumulação", group: "Aquecimento", trataAr: false },
  { value: "caldeira", label: "Caldeira", group: "Aquecimento", trataAr: false },

  // --- Hidráulica AVAC ---
  { value: "trocador_placas", label: "Trocador de calor a placas", group: "Hidráulica AVAC", trataAr: false },
  { value: "tanque_expansao", label: "Tanque de expansão", group: "Hidráulica AVAC", trataAr: false },
  { value: "separador_ar", label: "Separador de ar / de sujeira", group: "Hidráulica AVAC", trataAr: false },
  { value: "rede_agua_gelada", label: "Rede de água gelada (tubulação e isolamento)", group: "Hidráulica AVAC", trataAr: false },
  { value: "sistema_tratamento_agua", label: "Sistema de tratamento de água", group: "Hidráulica AVAC", trataAr: false },

  // --- Elétrica e controle ---
  { value: "qgbt", label: "QGBT — quadro geral de baixa tensão", group: "Elétrica e controle", trataAr: false },
  { value: "qdg", label: "QDG — quadro de distribuição geral", group: "Elétrica e controle", trataAr: false },
  { value: "qd_ac", label: "QD-AC — quadro de distribuição do ar condicionado", group: "Elétrica e controle", trataAr: false },
  { value: "ccm", label: "CCM — centro de controle de motores", group: "Elétrica e controle", trataAr: false },
  { value: "inversor_frequencia", label: "Inversor de frequência / soft-starter", group: "Elétrica e controle", trataAr: false },
  { value: "quadro_automacao", label: "Quadro de automação / CLP / BMS", group: "Elétrica e controle", trataAr: false },

  // --- Suprimento e apoio ---
  { value: "grupo_gerador", label: "Grupo motogerador", group: "Suprimento e apoio", trataAr: false },
  { value: "nobreak", label: "Nobreak / UPS", group: "Suprimento e apoio", trataAr: false },
  { value: "qta", label: "QTA — quadro de transferência automática", group: "Suprimento e apoio", trataAr: false },
  { value: "outro", label: "Outro", group: "Suprimento e apoio", trataAr: false },
];

const KEYS = (g: Categoria) => EQUIP_TIPOS.filter((t) => t.group === g).map((t) => t.value);

// grupos reutilizados nos filtros aplicaA
const DX = [
  "split_hi_wall", "split_piso_teto", "split_cassete", "split_duto", "multi_split",
  "vrf_vrv", "janela", "self_ar", "self_agua", "rooftop", "ptac", "portatil", "bomba_calor_ar",
];
const CHILLERS = ["chiller_ar", "chiller_agua"];
const SERPENTINA_AGUA = ["fancoil", "fancolete", "uta_ahu", "self_agua_gelada", "bateria_aquecimento"];
const VENTILADORES = KEYS("Ventilação e exaustão");
const BOMBAS_MOTOR = ["bomba_agua_gelada", "bomba_condensacao", "bomba_agua_quente"];
const QUADROS = ["qgbt", "qdg", "qd_ac", "ccm"];

// ---------------------------------------------------------------------------
// Plano mínimo da Portaria 3.523/98 art. 5º — só para equipamento que trata ar
// ---------------------------------------------------------------------------
export const PLANO_MINIMO_PORTARIA: AtividadePadrao[] = [
  { atividade: "Verificar e eliminar sujeira, danos e corrosão no gabinete, moldura, bandeja e serpentinas", periodicidade: "mensal", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Técnico" },
  { atividade: "Verificar e eliminar sujeira, obstruções, danos e fixação do sistema de tomada de ar externo e insuflamento", periodicidade: "mensal", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Técnico" },
  { atividade: "Limpar as bandejas, serpentinas, umidificadores, ventiladores e filtros", periodicidade: "mensal", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Técnico" },
  { atividade: "Verificar o estado de conservação do isolamento térmico do gabinete e dos dutos", periodicidade: "trimestral", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Técnico" },
  { atividade: "Verificar e eliminar as fontes de odores, executando ação corretiva imediata", periodicidade: "mensal", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Técnico" },
  { atividade: "Verificar e eliminar sujeira, obstruções e danos do sistema de captação e retorno de ar", periodicidade: "mensal", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Técnico" },
  { atividade: "Verificar a operação de drenagem de água da bandeja e limpar quando necessário", periodicidade: "mensal", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Técnico" },
  { atividade: "Verificar o estado de limpeza dos difusores, grelhas e venezianas e proceder a limpeza", periodicidade: "trimestral", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Técnico" },
  { atividade: "Verificar o estado dos filtros de ar, promovendo a limpeza ou substituição quando necessário", periodicidade: "mensal", norma_ref: "Portaria 3.523/98 art. 5º", responsavel: "Operador" },
  { atividade: "Medir e registrar temperatura, umidade relativa, velocidade e vazão do ar dos ambientes", periodicidade: "semestral", norma_ref: "RE 09/2003 ANVISA", responsavel: "Técnico" },
  { atividade: "Coletar e analisar a contagem total de fungos e bactérias (aerodispersóides biológicos)", periodicidade: "semestral", norma_ref: "RE 09/2003 ANVISA", responsavel: "Técnico" },
  { atividade: "Medir e registrar o teor de dióxido de carbono (CO₂) nos ambientes climatizados", periodicidade: "semestral", norma_ref: "RE 09/2003 ANVISA", responsavel: "Técnico" },
  { atividade: "Higienizar o sistema de climatização (serpentinas, bandejas, gabinete e dutos)", periodicidade: "anual", norma_ref: "NBR 14679", responsavel: "Técnico" },
];

// ---------------------------------------------------------------------------
// Planos por tipo / grupo de equipamento
// ---------------------------------------------------------------------------
export const PLANO_POR_TIPO: AtividadePadrao[] = [
  // ----- Circuito frigorífico (DX + bomba de calor) -----
  { atividade: "Verificar pressões de sucção e descarga, superaquecimento e subresfriamento", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: DX },
  { atividade: "Pesquisar vazamentos e verificar a carga de fluido refrigerante", periodicidade: "trimestral", norma_ref: "NBR 13971 / IN IBAMA", responsavel: "Técnico", aplicaA: DX },
  { atividade: "Medir tensão e corrente do compressor e dos motoventiladores", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: DX },
  { atividade: "Verificar contatoras, capacitores, relés, pressostatos e aperto das conexões elétricas", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: DX },
  { atividade: "Limpar quimicamente a serpentina condensadora", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: DX },
  { atividade: "Verificar ruído, vibração e fixação de compressor e ventiladores", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: DX },
  { atividade: "Aferir termostato / controlador, setpoints e ciclo de degelo", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: DX },
  { atividade: "Verificar válvula reversora e desempenho em aquecimento e resfriamento", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["vrf_vrv", "bomba_calor_ar"] },
  { atividade: "Verificar dampers de ar externo, retorno e exaustão, atuadores e economizer / free-cooling", periodicidade: "trimestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["rooftop", "self_ar", "self_agua"] },

  // ----- Chiller -----
  { atividade: "Verificar pressões e temperaturas de condensação e evaporação e o approach dos trocadores", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: CHILLERS },
  { atividade: "Analisar óleo e verificar nível no cárter do compressor", periodicidade: "semestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: CHILLERS },
  { atividade: "Pesquisar vazamentos e verificar a carga de fluido refrigerante", periodicidade: "trimestral", norma_ref: "NBR 13971 / IN IBAMA", responsavel: "Técnico", aplicaA: CHILLERS },
  { atividade: "Testar dispositivos de segurança (pressostatos, fluxostato, relé térmico, antithaw)", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: CHILLERS },
  { atividade: "Inspecionar e limpar os tubos do condensador e do evaporador", periodicidade: "anual", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: CHILLERS },
  { atividade: "Verificar partida suave / inversor, sequência de fases e desequilíbrio de corrente", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: CHILLERS },
  { atividade: "Medir e registrar a vibração dos compressores", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: CHILLERS },
  { atividade: "Limpar quimicamente a serpentina condensadora (chiller a ar)", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["chiller_ar"] },

  // ----- Serpentina de água (fancoil, UTA, self de água gelada, bateria) -----
  { atividade: "Limpar ou substituir os filtros de ar", periodicidade: "mensal", norma_ref: "Portaria 3.523/98", responsavel: "Operador", aplicaA: SERPENTINA_AGUA },
  { atividade: "Limpar a serpentina, a bandeja e o sifão de dreno", periodicidade: "trimestral", norma_ref: "Portaria 3.523/98", responsavel: "Técnico", aplicaA: SERPENTINA_AGUA },
  { atividade: "Sangrar o ar da serpentina e verificar a válvula de controle (2/3 vias) e o atuador", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: SERPENTINA_AGUA },
  { atividade: "Verificar caimento da bandeja, dreno e ausência de transbordamento", periodicidade: "mensal", norma_ref: "Portaria 3.523/98", responsavel: "Técnico", aplicaA: SERPENTINA_AGUA },
  { atividade: "Lubrificar mancais e verificar tensão/alinhamento de correias e polias", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["uta_ahu", "self_agua_gelada"] },
  { atividade: "Verificar vedação do gabinete, isolamento interno e pressão diferencial dos filtros", periodicidade: "mensal", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["uta_ahu"] },
  { atividade: "Verificar dampers de ar externo, atuadores, travamentos e umidificador", periodicidade: "trimestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["uta_ahu"] },
  { atividade: "Medir a vazão de ar e rebalancear os ambientes quando necessário", periodicidade: "anual", norma_ref: "NBR 16401-1", responsavel: "Técnico", aplicaA: ["uta_ahu", "self_agua_gelada"] },

  // ----- Torre de resfriamento -----
  { atividade: "Controlar tratamento de água: pH, condutividade, biocida, dispersante e inibidor de corrosão", periodicidade: "semanal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["torre_resfriamento"] },
  { atividade: "Pesquisar e controlar Legionella e contagem microbiológica da água", periodicidade: "trimestral", norma_ref: "CVS/ANVISA — Legionella", responsavel: "Técnico", aplicaA: ["torre_resfriamento"] },
  { atividade: "Limpar bacia, filtro e peneira; remover lodo e incrustações", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["torre_resfriamento"] },
  { atividade: "Verificar boia/válvula de reposição, nível de água e purga (blowdown)", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["torre_resfriamento"] },
  { atividade: "Inspecionar bicos aspersores, enchimento (fill) e eliminadores de gota", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["torre_resfriamento"] },
  { atividade: "Verificar ventilador, redutor/polias, nível de óleo, vibração e ruído", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["torre_resfriamento"] },
  { atividade: "Inspecionar estrutura, bacia, pintura e proteção contra corrosão", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["torre_resfriamento"] },

  // ----- Condensador remoto / dry cooler -----
  { atividade: "Limpar as aletas da serpentina e verificar amassados e corrosão", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["condensador_remoto", "dry_cooler"] },
  { atividade: "Verificar motoventiladores, rolamentos, controle de rotação (fan speed) e vibração", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["condensador_remoto", "dry_cooler"] },
  { atividade: "Verificar concentração de glicol e ausência de vazamentos (dry cooler)", periodicidade: "semestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["dry_cooler"] },

  // ----- Bombas com motor (água gelada / condensação / água quente) -----
  { atividade: "Verificar vazamentos no selo mecânico/gaxeta e no corpo da bomba", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },
  { atividade: "Medir temperatura e vibração dos mancais da bomba e do motor", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },
  { atividade: "Verificar ruído, cavitação e pressões de sucção e recalque", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },
  { atividade: "Lubrificar mancais conforme o fabricante", periodicidade: "trimestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },
  { atividade: "Verificar alinhamento eixo-motor e estado do acoplamento / luva elástica", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },
  { atividade: "Medir tensão, corrente e resistência de isolamento do motor", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },
  { atividade: "Verificar aperto de chumbadores, base de inércia e amortecedores de vibração", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },
  { atividade: "Testar bombas reserva e a alternância automática (stand-by)", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },
  { atividade: "Verificar válvulas de bloqueio e retenção, juntas de expansão e manômetros", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: BOMBAS_MOTOR },

  // ----- Bomba de dreno / recalque de condensado -----
  { atividade: "Verificar acionamento por boia, limpeza do reservatório e vazão de recalque", periodicidade: "mensal", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["bomba_dreno"] },
  { atividade: "Testar a chave de nível de segurança e o alarme de transbordo", periodicidade: "mensal", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["bomba_dreno"] },
  { atividade: "Verificar a linha de recalque, a válvula de retenção e o sifão", periodicidade: "trimestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["bomba_dreno"] },

  // ----- Bomba dosadora -----
  { atividade: "Verificar dosagem, calibração de vazão e estado da membrana/diafragma", periodicidade: "mensal", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["bomba_dosadora"] },
  { atividade: "Verificar nível de produto químico e integridade de mangueiras e válvulas", periodicidade: "mensal", norma_ref: "Manual do fabricante", responsavel: "Operador", aplicaA: ["bomba_dosadora"] },
  { atividade: "Limpar as válvulas de sucção e injeção e o filtro de pé", periodicidade: "trimestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["bomba_dosadora"] },

  // ----- Ventiladores e exaustores -----
  { atividade: "Limpar o rotor, a voluta e as grades de proteção", periodicidade: "trimestral", norma_ref: "Portaria 3.523/98", responsavel: "Técnico", aplicaA: VENTILADORES },
  { atividade: "Lubrificar mancais, verificar folgas e o estado dos rolamentos", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: VENTILADORES },
  { atividade: "Verificar tensão e alinhamento de correias e polias; substituir correias gastas", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: VENTILADORES },
  { atividade: "Medir e registrar vibração, ruído e balanceamento do conjunto", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: VENTILADORES },
  { atividade: "Medir tensão e corrente do motor e verificar o aperto das conexões", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: VENTILADORES },
  { atividade: "Verificar amortecedores de vibração, lonas de conexão flexível, damper e fixação", periodicidade: "semestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: VENTILADORES },

  // ----- Exaustão de cozinha / coifa -----
  { atividade: "Higienizar coifa, plenum, filtros inerciais e trecho de duto acessível", periodicidade: "mensal", norma_ref: "NBR 14518", responsavel: "Técnico", aplicaA: ["exaustao_cozinha"] },
  { atividade: "Verificar a caixa separadora de gordura e a drenagem", periodicidade: "mensal", norma_ref: "NBR 14518", responsavel: "Operador", aplicaA: ["exaustao_cozinha"] },
  { atividade: "Testar o sistema de supressão/abafamento de incêndio da coifa", periodicidade: "semestral", norma_ref: "NBR 14518", responsavel: "Técnico", aplicaA: ["exaustao_cozinha"] },
  { atividade: "Verificar o exaustor, correias e a vedação do duto de exaustão", periodicidade: "trimestral", norma_ref: "NBR 14518", responsavel: "Técnico", aplicaA: ["exaustao_cozinha"] },

  // ----- Pressurização de escada -----
  { atividade: "Testar o acionamento automático pelo sistema de detecção e alarme de incêndio", periodicidade: "mensal", norma_ref: "NBR 14880", responsavel: "Técnico", aplicaA: ["pressurizacao_escada"] },
  { atividade: "Medir a pressão diferencial e a velocidade do ar nas portas (com porta aberta e fechada)", periodicidade: "semestral", norma_ref: "NBR 14880", responsavel: "Técnico", aplicaA: ["pressurizacao_escada"] },
  { atividade: "Verificar o damper de alívio / sobrepressão e o seu atuador", periodicidade: "trimestral", norma_ref: "NBR 14880", responsavel: "Técnico", aplicaA: ["pressurizacao_escada"] },
  { atividade: "Verificar ventilador, correias, tomada de ar externo e obstruções", periodicidade: "trimestral", norma_ref: "NBR 14880", responsavel: "Técnico", aplicaA: ["pressurizacao_escada"] },

  // ----- Cortina de ar -----
  { atividade: "Limpar filtros, rotor e a serpentina (quando aquecida)", periodicidade: "mensal", norma_ref: "Manual do fabricante", responsavel: "Operador", aplicaA: ["cortina_ar"] },
  { atividade: "Verificar o acionamento por sensor de porta e a regulagem do fluxo", periodicidade: "trimestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["cortina_ar"] },
  { atividade: "Verificar rolamentos, ruído, resistência de aquecimento e termostato", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: ["cortina_ar"] },

  // ----- Caixa VAV -----
  { atividade: "Verificar atuador, sensor de vazão e a regulagem de vazão mínima e máxima", periodicidade: "semestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["caixa_vav"] },
  { atividade: "Limpar/trocar filtro e a serpentina de reaquecimento (quando houver)", periodicidade: "trimestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["caixa_vav"] },
  { atividade: "Verificar ruído e vazamento de ar na caixa e nas conexões", periodicidade: "semestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["caixa_vav"] },

  // ----- Caixa de filtragem / filtro de ar -----
  { atividade: "Medir a pressão diferencial dos filtros e registrar", periodicidade: "mensal", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["caixa_filtragem"] },
  { atividade: "Substituir os elementos filtrantes conforme a saturação (ΔP máximo)", periodicidade: "eventual", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["caixa_filtragem"] },
  { atividade: "Verificar vedação, molduras, e a ausência de by-pass de ar não filtrado", periodicidade: "trimestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["caixa_filtragem"] },
  { atividade: "Conferir a classe de filtragem instalada (G4/M5/F7/F9) e o registro no PMOC", periodicidade: "anual", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["caixa_filtragem"] },

  // ----- Filtro absoluto (HEPA) -----
  { atividade: "Verificar a pressão diferencial e a integridade do elemento filtrante", periodicidade: "mensal", norma_ref: "NBR 16401-3 / ISO 14644", responsavel: "Técnico", aplicaA: ["filtro_absoluto"] },
  { atividade: "Realizar teste de estanqueidade (DOP/PAO) após substituição", periodicidade: "eventual", norma_ref: "ISO 14644", responsavel: "Técnico", aplicaA: ["filtro_absoluto"] },
  { atividade: "Substituir o filtro conforme o ΔP máximo do fabricante", periodicidade: "eventual", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["filtro_absoluto"] },

  // ----- Umidificador / lavador de ar -----
  { atividade: "Limpar e descalcificar cilindro/eletrodos ou o meio evaporativo", periodicidade: "mensal", norma_ref: "RE 09/2003", responsavel: "Técnico", aplicaA: ["umidificador", "lavador_ar"] },
  { atividade: "Controlar a qualidade da água de alimentação, a purga e o tratamento", periodicidade: "mensal", norma_ref: "RE 09/2003", responsavel: "Técnico", aplicaA: ["umidificador", "lavador_ar"] },
  { atividade: "Desinfecção para controle microbiológico (fungos e bactérias)", periodicidade: "trimestral", norma_ref: "RE 09/2003", responsavel: "Técnico", aplicaA: ["umidificador", "lavador_ar"] },
  { atividade: "Verificar o controle de umidade, o sensor e os eliminadores de gota", periodicidade: "semestral", norma_ref: "RE 09/2003", responsavel: "Técnico", aplicaA: ["umidificador", "lavador_ar"] },
  { atividade: "Verificar a bomba de recirculação e o filtro da água (lavador)", periodicidade: "mensal", norma_ref: "RE 09/2003", responsavel: "Técnico", aplicaA: ["lavador_ar"] },

  // ----- Desumidificador -----
  { atividade: "Limpar filtro, serpentinas e bandeja; verificar dreno e bomba de condensado", periodicidade: "mensal", norma_ref: "Portaria 3.523/98", responsavel: "Técnico", aplicaA: ["desumidificador"] },
  { atividade: "Verificar rotor dessecante e o ciclo de reativação (tipo rotativo)", periodicidade: "semestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["desumidificador"] },
  { atividade: "Pesquisar vazamentos e verificar a carga de refrigerante (tipo por refrigeração)", periodicidade: "trimestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["desumidificador"] },

  // ----- Aquecimento: bateria elétrica / água quente -----
  { atividade: "Verificar resistências, isolação elétrica, contatoras e termostato de segurança", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: ["bateria_aquecimento"] },
  { atividade: "Limpar as aletas da serpentina de aquecimento", periodicidade: "trimestral", norma_ref: "Portaria 3.523/98", responsavel: "Técnico", aplicaA: ["bateria_aquecimento"] },
  { atividade: "Verificar a válvula de controle, a purga de ar e vazamentos (água quente)", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["bateria_aquecimento"] },
  { atividade: "Medir a corrente por estágio de aquecimento (bateria elétrica)", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: ["bateria_aquecimento"] },

  // ----- Boiler / aquecedor de acumulação -----
  { atividade: "Verificar termostato, pressostato e a válvula de segurança/alívio", periodicidade: "semestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["boiler"] },
  { atividade: "Drenar sedimentos e verificar o ânodo de sacrifício", periodicidade: "anual", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["boiler"] },
  { atividade: "Verificar o isolamento térmico, o sistema de aquecimento e vazamentos", periodicidade: "trimestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["boiler"] },

  // ----- Caldeira -----
  { atividade: "Analisar a água de alimentação e realizar a purga de fundo", periodicidade: "semanal", norma_ref: "NR-13", responsavel: "Operador", aplicaA: ["caldeira"] },
  { atividade: "Verificar queimador, chama e realizar análise dos gases de combustão", periodicidade: "trimestral", norma_ref: "NR-13", responsavel: "Técnico", aplicaA: ["caldeira"] },
  { atividade: "Testar válvulas de segurança, pressostatos e controle de nível", periodicidade: "trimestral", norma_ref: "NR-13", responsavel: "Técnico", aplicaA: ["caldeira"] },
  { atividade: "Inspeção interna, de tubos, refratários, isolamento e chaminé", periodicidade: "anual", norma_ref: "NR-13", responsavel: "Técnico", aplicaA: ["caldeira"] },

  // ----- Hidráulica AVAC -----
  { atividade: "Verificar perda de carga, aproximação térmica (fouling) e vazamentos nas gaxetas", periodicidade: "trimestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["trocador_placas"] },
  { atividade: "Realizar limpeza química (CIP) das placas e verificar o aperto do pacote (medida A)", periodicidade: "anual", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["trocador_placas"] },
  { atividade: "Verificar a pressão de pré-carga e a integridade da membrana", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["tanque_expansao"] },
  { atividade: "Verificar a válvula de segurança, o manômetro e sinais de corrosão", periodicidade: "semestral", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["tanque_expansao"] },
  { atividade: "Purga de ar e drenagem de sujeira/lodo; verificar vazamentos e isolamento", periodicidade: "mensal", norma_ref: "NBR 13971", responsavel: "Técnico", aplicaA: ["separador_ar"] },
  { atividade: "Inspecionar vazamentos, suportes, válvulas, manômetros e pontos de corrosão da rede", periodicidade: "semestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["rede_agua_gelada"] },
  { atividade: "Verificar o isolamento térmico e a barreira de vapor (condensação superficial)", periodicidade: "semestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["rede_agua_gelada"] },
  { atividade: "Controlar dureza, pH, cloro e ferro da água; regenerar/retrolavar filtros e abrandador", periodicidade: "mensal", norma_ref: "Port. GM/MS 888/2021", responsavel: "Técnico", aplicaA: ["sistema_tratamento_agua"] },
  { atividade: "Verificar dosagem de produtos, estoque e limpar/desinfetar reservatórios", periodicidade: "semestral", norma_ref: "Port. GM/MS 888/2021", responsavel: "Técnico", aplicaA: ["sistema_tratamento_agua"] },

  // ----- Distribuição de ar -----
  { atividade: "Inspecionar a rede de dutos: vazamentos, fixação, suportes e isolamento", periodicidade: "anual", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["rede_dutos"] },
  { atividade: "Verificar o estado de limpeza interna dos dutos e higienizar quando necessário", periodicidade: "anual", norma_ref: "NBR 14679", responsavel: "Técnico", aplicaA: ["rede_dutos"] },
  { atividade: "Limpar difusores, grelhas e venezianas; verificar fixação e regulagem das aletas", periodicidade: "trimestral", norma_ref: "Portaria 3.523/98", responsavel: "Técnico", aplicaA: ["difusores_grelhas"] },
  { atividade: "Rebalancear a vazão de ar dos ambientes", periodicidade: "anual", norma_ref: "NBR 16401-1", responsavel: "Técnico", aplicaA: ["difusores_grelhas", "rede_dutos"] },
  { atividade: "Testar o fechamento do damper corta-fogo e o fusível/elo térmico", periodicidade: "anual", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["damper"] },
  { atividade: "Verificar atuador, mola de retorno, fins de curso, lubrificação e vedação do damper", periodicidade: "semestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["damper"] },

  // ----- Quadros elétricos (QGBT / QDG / QD-AC / CCM) -----
  { atividade: "Realizar inspeção termográfica das conexões, barramentos, disjuntores e contatoras", periodicidade: "semestral", norma_ref: "NBR 15424 / NR-10", responsavel: "Técnico", aplicaA: QUADROS },
  { atividade: "Reaperto das conexões e barramentos com o circuito desenergizado", periodicidade: "anual", norma_ref: "NBR 5410 / NR-10", responsavel: "Técnico", aplicaA: QUADROS },
  { atividade: "Limpeza interna, remoção de poeira e umidade e verificação da vedação (grau IP)", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: QUADROS },
  { atividade: "Verificar disjuntores, contatoras, relés de proteção, fusíveis e sinalizações", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: QUADROS },
  { atividade: "Testar dispositivos DR e verificar a continuidade e a resistência do aterramento", periodicidade: "anual", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: QUADROS },
  { atividade: "Medir a resistência de isolamento dos circuitos alimentadores", periodicidade: "anual", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: QUADROS },
  { atividade: "Medir tensão, corrente e desequilíbrio entre fases sob carga", periodicidade: "trimestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: QUADROS },
  { atividade: "Verificar ventilação/exaustão do painel, resistência de aquecimento e termostato", periodicidade: "semestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: QUADROS },
  { atividade: "Conferir a identificação dos circuitos, o diagrama unifilar atualizado e prensa-cabos", periodicidade: "anual", norma_ref: "NR-10", responsavel: "Técnico", aplicaA: QUADROS },

  // ----- Inversor de frequência / soft-starter -----
  { atividade: "Limpar dissipadores e verificar os ventiladores de resfriamento do inversor", periodicidade: "semestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["inversor_frequencia"] },
  { atividade: "Reaperto das conexões de potência e de controle", periodicidade: "anual", norma_ref: "NR-10", responsavel: "Técnico", aplicaA: ["inversor_frequencia"] },
  { atividade: "Verificar parâmetros, rampas, proteções, harmônicas e temperatura de operação", periodicidade: "semestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["inversor_frequencia"] },
  { atividade: "Verificar filtros/reatores de linha e os capacitores do barramento CC", periodicidade: "anual", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["inversor_frequencia"] },

  // ----- Automação / CLP / BMS -----
  { atividade: "Verificar comunicação, pontos de I/O, sensores de campo e atuadores", periodicidade: "trimestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["quadro_automacao"] },
  { atividade: "Aferir sensores de temperatura, umidade e pressão do sistema", periodicidade: "semestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["quadro_automacao"] },
  { atividade: "Testar rotinas de alarme, intertravamento e resposta à falta de energia", periodicidade: "semestral", norma_ref: "NBR 16401-3", responsavel: "Técnico", aplicaA: ["quadro_automacao"] },
  { atividade: "Realizar backup dos programas e parâmetros e verificar a fonte/nobreak do sistema", periodicidade: "semestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["quadro_automacao"] },

  // ----- Grupo motogerador -----
  { atividade: "Realizar teste de partida e operação em carga do grupo gerador", periodicidade: "mensal", norma_ref: "NBR ISO 8528", responsavel: "Técnico", aplicaA: ["grupo_gerador"] },
  { atividade: "Verificar nível de óleo, água de arrefecimento, combustível e aditivos", periodicidade: "semanal", norma_ref: "NBR ISO 8528", responsavel: "Operador", aplicaA: ["grupo_gerador"] },
  { atividade: "Verificar bateria de partida, carregador flutuador e terminais", periodicidade: "mensal", norma_ref: "NBR ISO 8528", responsavel: "Técnico", aplicaA: ["grupo_gerador"] },
  { atividade: "Trocar óleo lubrificante e filtros de óleo, ar e combustível", periodicidade: "anual", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["grupo_gerador"] },
  { atividade: "Verificar sistema de arrefecimento, correias, mangueiras, escapamento e ventilação da casa de máquinas", periodicidade: "trimestral", norma_ref: "NBR ISO 8528", responsavel: "Técnico", aplicaA: ["grupo_gerador"] },

  // ----- QTA -----
  { atividade: "Verificar tempos de comutação rede/gerador e retorno, e o modo de teste do QTA", periodicidade: "trimestral", norma_ref: "NBR 5410", responsavel: "Técnico", aplicaA: ["qta"] },
  { atividade: "Inspeção termográfica, reaperto de conexões e verificação de contatoras/intertravamento", periodicidade: "semestral", norma_ref: "NBR 15424 / NR-10", responsavel: "Técnico", aplicaA: ["qta"] },

  // ----- Nobreak / UPS -----
  { atividade: "Verificar tensão, corrente, impedância e temperatura das baterias", periodicidade: "trimestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["nobreak"] },
  { atividade: "Realizar teste de autonomia em carga e verificar o bypass e os alarmes", periodicidade: "semestral", norma_ref: "Manual do fabricante", responsavel: "Técnico", aplicaA: ["nobreak"] },
  { atividade: "Limpar ventiladores e filtros e reapertar as conexões de potência", periodicidade: "anual", norma_ref: "NR-10", responsavel: "Técnico", aplicaA: ["nobreak"] },
];

// ---------------------------------------------------------------------------
// Padrões referenciais de qualidade do ar (RE 09/2003)
// ---------------------------------------------------------------------------
export const PADRAO_QUALIDADE_AR = {
  temperatura_c: { min: 23, max: 26, unidade: "°C" },
  umidade_rel: { min: 40, max: 65, unidade: "%" },
  velocidade_ar_ms: { max: 0.25, unidade: "m/s" },
  co2_ppm: { max: 1000, unidade: "ppm", nota: "diferencial ≤ 700 ppm sobre o ar externo" },
  contagem_fungica_ufc: {
    max: 750,
    unidade: "UFC/m³",
    nota: "e relação I/E ≤ 1,5 (interno/externo)",
  },
} as const;

export function planoPadraoParaTipo(tipo: string): AtividadePadrao[] {
  const meta = EQUIP_TIPOS.find((t) => t.value === tipo);
  const base = meta?.trataAr ? PLANO_MINIMO_PORTARIA : [];
  const especifico = PLANO_POR_TIPO.filter((a) => a.aplicaA?.includes(tipo));
  return [...base, ...especifico];
}

export function proximaData(ultima: Date, p: Periodicidade): Date | null {
  const meses = PERIODICIDADE_MESES[p];
  if (!meses) return null;
  const d = new Date(ultima);
  if (meses < 1) {
    d.setDate(d.getDate() + Math.round(meses * 30));
  } else {
    d.setMonth(d.getMonth() + meses);
  }
  return d;
}
