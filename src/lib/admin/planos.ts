// Preço e limites dos planos do SeuPMOC (o que você cobra dos seus clientes —
// as empresas de climatização). Fonte única usada no /admin.
export const PLANOS = {
  gratis: { label: "Grátis", preco: 0, max_clientes: 1, max_equipamentos: 15 },
  essencial: { label: "Essencial", preco: 97, max_clientes: 10, max_equipamentos: 150 },
  profissional: { label: "Profissional", preco: 179, max_clientes: 30, max_equipamentos: 500 },
  ilimitado: { label: "Ilimitado", preco: 299, max_clientes: null, max_equipamentos: null },
} as const;

export type PlanoKey = keyof typeof PLANOS;

export const STATUS_LABEL: Record<string, string> = {
  trial: "Em teste",
  ativa: "Ativa",
  atrasada: "Atrasada",
  cancelada: "Cancelada",
};
