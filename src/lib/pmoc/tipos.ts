// Snapshot que vai em pmoc_documents.dados_json e alimenta o PDF.
export interface PmocSnapshot {
  emitidoEm: string;
  periodo: { inicio: string; fim: string };
  mesInicio?: number; // 1-12, mês em que o plano começa (p/ cronograma)
  prestador: {
    nome: string;
    cnpj?: string;
    telefone?: string;
    email?: string;
  };
  estabelecimento: {
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj?: string;
    endereco: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    areaClimatizadaM2?: number;
    populacaoFixa?: number;
    populacaoFlutuante?: number;
  };
  responsavelTecnico?: {
    nome: string;
    formacao?: string;
    conselho?: string;
    numeroRegistro?: string;
    artNumero?: string;
  };
  equipamentos: Array<{
    tag: string;
    tipo: string;
    marca?: string;
    modelo?: string;
    capacidadeBtu?: number;
    fluido?: string;
    vazaoArExteriorM3h?: number;
    localizacao?: string;
    ambientesAtendidos?: string;
    plano: Array<{
      atividade: string;
      periodicidade: string;
      normaRef?: string;
      responsavel?: string;
    }>;
  }>;
  execucoes: Array<{
    data: string;
    equipamentoTag?: string;
    tipo: string;
    responsavel?: string;
    descricao?: string;
    ocorrencias?: string;
  }>;
  qualidadeAr: Array<{
    dataMedicao: string;
    ambiente?: string;
    temperaturaC?: number;
    umidadeRel?: number;
    co2Ppm?: number;
    contagemFungicaUfc?: number;
    dentroPadrao?: boolean;
  }>;
}
