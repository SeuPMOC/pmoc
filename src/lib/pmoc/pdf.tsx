import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PmocSnapshot } from "./tipos";
import { PADRAO_QUALIDADE_AR } from "./catalogo";
import { CronogramaTabela } from "./pdf-cronograma";

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#111" },
  h1: { fontSize: 15, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  h2: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 4,
    borderBottom: "1pt solid #333",
    paddingBottom: 2,
  },
  muted: { color: "#555" },
  row: { flexDirection: "row" },
  cell: { padding: 3, borderRight: "0.5pt solid #999", flexGrow: 1 },
  th: {
    padding: 3,
    borderRight: "0.5pt solid #999",
    backgroundColor: "#eee",
    fontFamily: "Helvetica-Bold",
    flexGrow: 1,
  },
  trow: { flexDirection: "row", borderBottom: "0.5pt solid #999" },
  cgAtiv: { padding: 3, borderRight: "0.5pt solid #999", flexGrow: 1, flexBasis: 0 },
  cgPer: { padding: 3, borderRight: "0.5pt solid #999", flexBasis: 62, flexShrink: 0 },
  cgMes: {
    padding: 3, borderRight: "0.5pt solid #999", flexBasis: 26, flexShrink: 0,
    textAlign: "center",
  },
  cgMark: { textAlign: "center", fontFamily: "Helvetica-Bold" },
  kv: { flexDirection: "row", marginBottom: 2 },
  k: { width: 150, fontFamily: "Helvetica-Bold" },
  v: { flexGrow: 1 },
  foot: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#888",
    borderTop: "0.5pt solid #ccc",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const KV = ({ k, v }: { k: string; v?: string | number }) =>
  v === undefined || v === "" || v === null ? null : (
    <View style={s.kv}>
      <Text style={s.k}>{k}</Text>
      <Text style={s.v}>{String(v)}</Text>
    </View>
  );

export function PmocPdf({ d }: { d: PmocSnapshot }) {
  return (
    <Document title={`PMOC ${d.estabelecimento.razaoSocial}`}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>
          Plano de Manutenção, Operação e Controle — PMOC
        </Text>
        <Text style={s.muted}>
          Lei nº 13.589/2018 · Portaria MS nº 3.523/1998 · ABNT NBR 13971 · RE
          ANVISA nº 09/2003
        </Text>
        <Text style={{ marginTop: 4 }}>
          Período de referência: {d.periodo.inicio} a {d.periodo.fim} · Emitido
          em {d.emitidoEm}
        </Text>

        <Text style={s.h2}>1. Identificação do estabelecimento</Text>
        <KV k="Razão social" v={d.estabelecimento.razaoSocial} />
        <KV k="Nome fantasia" v={d.estabelecimento.nomeFantasia} />
        <KV k="CNPJ" v={d.estabelecimento.cnpj} />
        <KV
          k="Endereço"
          v={[
            d.estabelecimento.endereco,
            d.estabelecimento.cidade,
            d.estabelecimento.uf,
            d.estabelecimento.cep,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <KV
          k="Área climatizada"
          v={
            d.estabelecimento.areaClimatizadaM2
              ? `${d.estabelecimento.areaClimatizadaM2} m²`
              : undefined
          }
        />
        <KV k="População fixa" v={d.estabelecimento.populacaoFixa} />
        <KV k="População flutuante" v={d.estabelecimento.populacaoFlutuante} />

        <Text style={s.h2}>2. Prestador do serviço</Text>
        <KV k="Empresa" v={d.prestador.nome} />
        <KV k="CNPJ" v={d.prestador.cnpj} />
        <KV k="Contato" v={[d.prestador.telefone, d.prestador.email].filter(Boolean).join(" · ")} />

        <Text style={s.h2}>3. Responsável técnico</Text>
        {d.responsavelTecnico ? (
          <>
            <KV k="Nome" v={d.responsavelTecnico.nome} />
            <KV k="Formação" v={d.responsavelTecnico.formacao} />
            <KV
              k="Registro no conselho"
              v={[d.responsavelTecnico.conselho, d.responsavelTecnico.numeroRegistro]
                .filter(Boolean)
                .join(" ")}
            />
            <KV k="ART/TRT nº" v={d.responsavelTecnico.artNumero} />
          </>
        ) : (
          <Text style={s.muted}>Não informado.</Text>
        )}

        <Text style={s.h2}>4. Inventário dos equipamentos</Text>
        <View style={s.trow}>
          <Text style={[s.th, { flexBasis: 40 }]}>TAG</Text>
          <Text style={s.th}>Tipo</Text>
          <Text style={s.th}>Marca/Modelo</Text>
          <Text style={[s.th, { flexBasis: 50 }]}>BTU/h</Text>
          <Text style={s.th}>Ar externo</Text>
          <Text style={s.th}>Localização / ambientes</Text>
        </View>
        {d.equipamentos.map((e, i) => (
          <View style={s.trow} key={i} wrap={false}>
            <Text style={[s.cell, { flexBasis: 40 }]}>{e.tag}</Text>
            <Text style={s.cell}>{e.tipo}</Text>
            <Text style={s.cell}>{[e.marca, e.modelo].filter(Boolean).join(" ")}</Text>
            <Text style={[s.cell, { flexBasis: 50 }]}>{e.capacidadeBtu ?? "-"}</Text>
            <Text style={s.cell}>
              {e.vazaoArExteriorM3h ? `${e.vazaoArExteriorM3h} m³/h` : "-"}
            </Text>
            <Text style={s.cell}>
              {[e.localizacao, e.ambientesAtendidos].filter(Boolean).join(" — ")}
            </Text>
          </View>
        ))}

        <Text style={s.h2}>5. Plano de manutenção preventiva</Text>
        {d.equipamentos.map((e, i) => (
          <View key={i} wrap={false} style={{ marginBottom: 6 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
              {e.tag} — {e.tipo}
            </Text>
            <View style={s.trow}>
              <Text style={s.th}>Atividade</Text>
              <Text style={[s.th, { flexBasis: 70 }]}>Periodicidade</Text>
              <Text style={[s.th, { flexBasis: 60 }]}>Responsável</Text>
              <Text style={[s.th, { flexBasis: 90 }]}>Norma</Text>
            </View>
            {e.plano.map((p, j) => (
              <View style={s.trow} key={j} wrap={false}>
                <Text style={s.cell}>{p.atividade}</Text>
                <Text style={[s.cell, { flexBasis: 70 }]}>{p.periodicidade}</Text>
                <Text style={[s.cell, { flexBasis: 60 }]}>{p.responsavel ?? "-"}</Text>
                <Text style={[s.cell, { flexBasis: 90 }]}>{p.normaRef ?? "-"}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={s.h2}>6. Registro das atividades executadas</Text>
        {d.execucoes.length === 0 ? (
          <Text style={s.muted}>Nenhuma execução registrada no período.</Text>
        ) : (
          <>
            <View style={s.trow}>
              <Text style={[s.th, { flexBasis: 60 }]}>Data</Text>
              <Text style={[s.th, { flexBasis: 45 }]}>TAG</Text>
              <Text style={[s.th, { flexBasis: 60 }]}>Tipo</Text>
              <Text style={s.th}>Descrição / ocorrências</Text>
              <Text style={[s.th, { flexBasis: 90 }]}>Responsável</Text>
            </View>
            {d.execucoes.map((x, i) => (
              <View style={s.trow} key={i} wrap={false}>
                <Text style={[s.cell, { flexBasis: 60 }]}>{x.data}</Text>
                <Text style={[s.cell, { flexBasis: 45 }]}>{x.equipamentoTag ?? "-"}</Text>
                <Text style={[s.cell, { flexBasis: 60 }]}>{x.tipo}</Text>
                <Text style={s.cell}>
                  {[x.descricao, x.ocorrencias].filter(Boolean).join(" · ")}
                </Text>
                <Text style={[s.cell, { flexBasis: 90 }]}>{x.responsavel ?? "-"}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={s.h2}>7. Qualidade do ar interior</Text>
        <Text style={s.muted}>
          Padrão referencial RE 09/2003: temp. {PADRAO_QUALIDADE_AR.temperatura_c.min}–
          {PADRAO_QUALIDADE_AR.temperatura_c.max} °C · UR{" "}
          {PADRAO_QUALIDADE_AR.umidade_rel.min}–{PADRAO_QUALIDADE_AR.umidade_rel.max}% · CO₂ ≤{" "}
          {PADRAO_QUALIDADE_AR.co2_ppm.max} ppm · fungos ≤{" "}
          {PADRAO_QUALIDADE_AR.contagem_fungica_ufc.max} UFC/m³
        </Text>
        {d.qualidadeAr.length > 0 && (
          <>
            <View style={[s.trow, { marginTop: 4 }]}>
              <Text style={[s.th, { flexBasis: 60 }]}>Data</Text>
              <Text style={s.th}>Ambiente</Text>
              <Text style={[s.th, { flexBasis: 45 }]}>Temp.</Text>
              <Text style={[s.th, { flexBasis: 40 }]}>UR%</Text>
              <Text style={[s.th, { flexBasis: 50 }]}>CO₂</Text>
              <Text style={[s.th, { flexBasis: 55 }]}>Fungos</Text>
              <Text style={[s.th, { flexBasis: 50 }]}>Situação</Text>
            </View>
            {d.qualidadeAr.map((q, i) => (
              <View style={s.trow} key={i} wrap={false}>
                <Text style={[s.cell, { flexBasis: 60 }]}>{q.dataMedicao}</Text>
                <Text style={s.cell}>{q.ambiente ?? "-"}</Text>
                <Text style={[s.cell, { flexBasis: 45 }]}>{q.temperaturaC ?? "-"}</Text>
                <Text style={[s.cell, { flexBasis: 40 }]}>{q.umidadeRel ?? "-"}</Text>
                <Text style={[s.cell, { flexBasis: 50 }]}>{q.co2Ppm ?? "-"}</Text>
                <Text style={[s.cell, { flexBasis: 55 }]}>{q.contagemFungicaUfc ?? "-"}</Text>
                <Text style={[s.cell, { flexBasis: 50 }]}>
                  {q.dentroPadrao === undefined
                    ? "-"
                    : q.dentroPadrao
                      ? "Conforme"
                      : "Não conforme"}
                </Text>
              </View>
            ))}
          </>
        )}

        <Text style={s.h2}>8. Assinaturas</Text>
        <View style={[s.row, { marginTop: 30, justifyContent: "space-between" }]}>
          <View style={{ width: "45%", borderTop: "0.5pt solid #333", paddingTop: 3 }}>
            <Text>{d.responsavelTecnico?.nome ?? "Responsável técnico"}</Text>
            <Text style={s.muted}>
              {[d.responsavelTecnico?.conselho, d.responsavelTecnico?.numeroRegistro]
                .filter(Boolean)
                .join(" ")}
            </Text>
          </View>
          <View style={{ width: "45%", borderTop: "0.5pt solid #333", paddingTop: 3 }}>
            <Text>Responsável pelo estabelecimento</Text>
            <Text style={s.muted}>{d.estabelecimento.razaoSocial}</Text>
          </View>
        </View>

        <View style={s.foot} fixed>
          <Text>{d.estabelecimento.razaoSocial} — PMOC</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* --- Cronograma anual de execução (paisagem) --- */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <Text style={s.h1}>Cronograma anual de execução</Text>
        <Text style={s.muted}>
          {d.estabelecimento.razaoSocial} · período {d.periodo.inicio} a {d.periodo.fim}.
          {"  "}● = manutenção prevista no mês · registrar data e visto do executante na
          célula correspondente.
        </Text>

        <CronogramaTabela
          equipamentos={d.equipamentos}
          mesInicio={d.mesInicio ?? 1}
          marcar="●"
        />

        <View style={s.foot} fixed>
          <Text>{d.estabelecimento.razaoSocial} — Cronograma PMOC</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
