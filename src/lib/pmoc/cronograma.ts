import type { Periodicidade } from "./catalogo";

export const MESES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

// passo em meses por periodicidade (0 = sem mês fixo)
const PASSO: Record<Periodicidade, number> = {
  semanal: 1, mensal: 1, bimestral: 2, trimestral: 3,
  semestral: 6, anual: 12, eventual: 0,
};

// Meses (1..12) em que a atividade é prevista. `eventual` -> [].
export function mesesPrevistos(p: Periodicidade, mesInicio = 1): number[] {
  const passo = PASSO[p];
  if (!passo) return [];
  if (p === "semanal" || p === "mensal") {
    return Array.from({ length: 12 }, (_, i) => ((mesInicio - 1 + i) % 12) + 1);
  }
  const out: number[] = [];
  for (let i = 0; i < 12; i += passo) {
    out.push(((mesInicio - 1 + i) % 12) + 1);
  }
  return out;
}

export interface LinhaCronograma {
  atividade: string;
  periodicidade: Periodicidade;
  norma_ref?: string;
  responsavel?: string;
  meses: boolean[]; // 12 posições, índice 0 = Janeiro
}

export function cronogramaEquipamento(
  plano: Array<{
    atividade: string;
    periodicidade: string;
    normaRef?: string;
    norma_ref?: string;
    responsavel?: string;
  }>,
  mesInicio = 1,
): LinhaCronograma[] {
  return plano.map((p) => {
    const per = p.periodicidade as Periodicidade;
    const previstos = new Set(mesesPrevistos(per, mesInicio));
    return {
      atividade: p.atividade,
      periodicidade: per,
      norma_ref: p.normaRef ?? p.norma_ref,
      responsavel: p.responsavel,
      meses: Array.from({ length: 12 }, (_, i) => previstos.has(i + 1)),
    };
  });
}
