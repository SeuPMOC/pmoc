import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { cronogramaEquipamento, MESES_ABREV } from "./cronograma";

export interface EquipCronograma {
  tag: string;
  tipo: string;
  localizacao?: string;
  plano: Array<{
    atividade: string;
    periodicidade: string;
    normaRef?: string;
    norma_ref?: string;
    responsavel?: string;
  }>;
}

const c = StyleSheet.create({
  eqTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, marginTop: 10, marginBottom: 2 },
  row: { flexDirection: "row", borderBottom: "0.5pt solid #999" },
  ativ: { padding: 3, borderRight: "0.5pt solid #999", flexGrow: 1, flexBasis: 0 },
  per: { padding: 3, borderRight: "0.5pt solid #999", flexBasis: 58, flexShrink: 0 },
  resp: { padding: 3, borderRight: "0.5pt solid #999", flexBasis: 46, flexShrink: 0 },
  mes: {
    padding: 3, borderRight: "0.5pt solid #999", flexBasis: 24, flexShrink: 0,
    textAlign: "center",
  },
  head: { backgroundColor: "#eee", fontFamily: "Helvetica-Bold" },
  norma: { fontSize: 6.5, color: "#666" },
  mark: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#666", fontSize: 8 },
});

// `marcar`: como marcar o mês previsto ("○" p/ planilha em branco, "●" p/ cronograma)
export function CronogramaTabela({
  equipamentos,
  mesInicio = 1,
  marcar = "○",
}: {
  equipamentos: EquipCronograma[];
  mesInicio?: number;
  marcar?: string;
}) {
  return (
    <>
      {equipamentos.map((e, i) => {
        const linhas = cronogramaEquipamento(e.plano, mesInicio);
        return (
          <View key={i} wrap={false}>
            <Text style={c.eqTitle}>
              {e.tag} — {e.tipo}
              {e.localizacao ? ` · ${e.localizacao}` : ""}
            </Text>
            <View style={c.row}>
              <Text style={[c.ativ, c.head]}>Atividade de manutenção</Text>
              <Text style={[c.per, c.head]}>Periodic.</Text>
              <Text style={[c.resp, c.head]}>Resp.</Text>
              {MESES_ABREV.map((m) => (
                <Text key={m} style={[c.mes, c.head]}>{m}</Text>
              ))}
            </View>
            {linhas.map((l, j) => (
              <View style={c.row} key={j} wrap={false}>
                <View style={c.ativ}>
                  <Text>{l.atividade}</Text>
                  {l.norma_ref ? <Text style={c.norma}>{l.norma_ref}</Text> : null}
                </View>
                <Text style={c.per}>{l.periodicidade}</Text>
                <Text style={c.resp}>{l.responsavel ?? "-"}</Text>
                {l.meses.map((prev, k) => (
                  <Text key={k} style={[c.mes, c.mark]}>{prev ? marcar : ""}</Text>
                ))}
              </View>
            ))}
            {linhas.every((l) => l.meses.every((x) => !x)) && (
              <Text style={c.muted}>Atividades sem periodicidade fixa — executar conforme necessidade.</Text>
            )}
          </View>
        );
      })}
    </>
  );
}
