import { createElement } from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/supabase/auth";
import { PlanilhaAcompanhamento } from "@/lib/pmoc/planilha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ano =
    Number(new URL(req.url).searchParams.get("ano")) || new Date().getFullYear();
  const tecnicoId = new URL(req.url).searchParams.get("tecnico");

  const { supabase, profile } = await requireUser();

  const [{ data: org }, { data: client }, { data: tec }, { data: equipamentos }] =
    await Promise.all([
      supabase.from("organizations").select("name").eq("id", profile.org_id).single(),
      supabase.from("clients").select("*").eq("id", id).single(),
      tecnicoId
        ? supabase.from("technicians").select("*").eq("id", tecnicoId).single()
        : supabase
            .from("technicians")
            .select("*")
            .eq("org_id", profile.org_id)
            .limit(1)
            .maybeSingle(),
      supabase
        .from("equipment")
        .select("*, maintenance_plan_items(*)")
        .eq("client_id", id)
        .eq("status", "ativo")
        .order("tag"),
    ]);

  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const d = {
    prestador: { nome: org?.name ?? "" },
    estabelecimento: {
      razaoSocial: client.razao_social,
      cnpj: client.cnpj ?? undefined,
      endereco: [client.endereco, client.numero, client.bairro].filter(Boolean).join(", "),
      cidade: client.cidade ?? undefined,
      uf: client.uf ?? undefined,
    },
    responsavelTecnico: tec
      ? {
          nome: tec.nome,
          conselho: tec.conselho ?? undefined,
          numeroRegistro: tec.numero_registro ?? undefined,
          artNumero: tec.art_numero ?? undefined,
        }
      : undefined,
    equipamentos: (equipamentos ?? []).map((e) => ({
      tag: e.tag,
      tipo: e.tipo,
      localizacao: e.localizacao ?? undefined,
      plano: (e.maintenance_plan_items ?? []).map((p: Record<string, unknown>) => ({
        atividade: p.atividade as string,
        periodicidade: p.periodicidade as string,
        norma_ref: (p.norma_ref as string) ?? undefined,
        responsavel: (p.responsavel as string) ?? undefined,
      })),
    })),
  };

  const buffer = await renderToBuffer(
    createElement(PlanilhaAcompanhamento, { d, ano }) as Parameters<
      typeof renderToBuffer
    >[0],
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="planilha-acompanhamento-${ano}.pdf"`,
    },
  });
}
