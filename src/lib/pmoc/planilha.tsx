import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CronogramaTabela, type EquipCronograma } from "./pdf-cronograma";

export interface PlanilhaData {
  prestador: { nome: string };
  estabelecimento: {
    razaoSocial: string;
    cnpj?: string;
    endereco?: string;
    cidade?: string;
    uf?: string;
  };
  responsavelTecnico?: {
    nome: string;
    conselho?: string;
    numeroRegistro?: string;
    artNumero?: string;
  };
  equipamentos: EquipCronograma[];
}

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 8.5, fontFamily: "Helvetica", color: "#111" },
  h1: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  sub: { color: "#555", marginBottom: 8 },
  kv: { flexDirection: "row", marginBottom: 1 },
  k: { width: 120, fontFamily: "Helvetica-Bold" },
  box: {
    border: "0.5pt solid #999",
    padding: 6,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  instr: { fontSize: 8, color: "#333", marginBottom: 8 },
  sign: { flexDirection: "row", justifyContent: "space-between", marginTop: 26, gap: 24 },
  signCol: { flexGrow: 1, borderTop: "0.5pt solid #333", paddingTop: 3 },
  foot: {
    position: "absolute",
    bottom: 16,
    left: 30,
    right: 30,
    fontSize: 7,
    color: "#888",
    borderTop: "0.5pt solid #ccc",
    paddingTop: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

// Planilha física que permanece no estabelecimento.
export function PlanilhaAcompanhamento({
  d,
  ano,
}: {
  d: PlanilhaData;
  ano: number;
}) {
  return (
    <Document title={`Planilha de acompanhamento — ${d.estabelecimento.razaoSocial}`}>
      <Page size="A4" orientation="landscape" style={s.page}>
        <Text style={s.h1}>Planilha de acompanhamento de manutenção — PMOC</Text>
        <Text style={s.sub}>
          Ano de referência {ano} · Lei nº 13.589/2018 · Portaria MS nº 3.523/1998
        </Text>

        <View style={s.box}>
          <View style={s.kv}>
            <Text style={s.k}>Estabelecimento</Text>
            <Text>
              {d.estabelecimento.razaoSocial}
              {d.estabelecimento.cnpj ? ` · CNPJ ${d.estabelecimento.cnpj}` : ""}
            </Text>
          </View>
          <View style={s.kv}>
            <Text style={s.k}>Endereço</Text>
            <Text>
              {[
                d.estabelecimento.endereco,
                d.estabelecimento.cidade,
                d.estabelecimento.uf,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
          <View style={s.kv}>
            <Text style={s.k}>Empresa responsável</Text>
            <Text>{d.prestador.nome}</Text>
          </View>
          {d.responsavelTecnico ? (
            <View style={s.kv}>
              <Text style={s.k}>Responsável técnico</Text>
              <Text>
                {d.responsavelTecnico.nome}
                {d.responsavelTecnico.conselho
                  ? ` · ${d.responsavelTecnico.conselho} ${d.responsavelTecnico.numeroRegistro ?? ""}`
                  : ""}
                {d.responsavelTecnico.artNumero ? ` · ART ${d.responsavelTecnico.artNumero}` : ""}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={s.instr}>
          Esta planilha deve permanecer no estabelecimento, à disposição da
          fiscalização. ○ = manutenção prevista para o mês. A cada serviço
          realizado, registre a data e o visto do executante na célula
          correspondente.
        </Text>

        <CronogramaTabela equipamentos={d.equipamentos} mesInicio={1} marcar="○" />

        <View style={s.sign}>
          <View style={s.signCol}>
            <Text>{d.responsavelTecnico?.nome ?? "Responsável técnico"}</Text>
            <Text style={{ color: "#666" }}>
              {[d.responsavelTecnico?.conselho, d.responsavelTecnico?.numeroRegistro]
                .filter(Boolean)
                .join(" ")}
            </Text>
          </View>
          <View style={s.signCol}>
            <Text>Responsável pelo estabelecimento</Text>
            <Text style={{ color: "#666" }}>{d.estabelecimento.razaoSocial}</Text>
          </View>
        </View>

        <View style={s.foot} fixed>
          <Text>{d.estabelecimento.razaoSocial} — Planilha de acompanhamento {ano}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
