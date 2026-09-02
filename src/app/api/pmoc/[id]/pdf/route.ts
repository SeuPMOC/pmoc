import { createElement } from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PmocPdf } from "@/lib/pmoc/pdf";
import type { PmocSnapshot } from "@/lib/pmoc/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: doc, error } = await supabase
    .from("pmoc_documents")
    .select("dados_json, art_numero, art_path")
    .eq("id", id)
    .single();

  if (error || !doc?.dados_json) {
    return NextResponse.json({ error: "PMOC não encontrado" }, { status: 404 });
  }

  const d = doc.dados_json as PmocSnapshot;
  // número da ART é gravado após a emissão — reflete o valor atual no PDF
  if (doc.art_numero) {
    d.responsavelTecnico = {
      nome: d.responsavelTecnico?.nome ?? "Responsável técnico",
      ...d.responsavelTecnico,
      artNumero: doc.art_numero,
    };
  }

  let pdfBytes: Uint8Array = new Uint8Array(
    await renderToBuffer(
      createElement(PmocPdf, { d }) as Parameters<typeof renderToBuffer>[0],
    ),
  );

  // anexa as páginas da ART, se houver arquivo
  if (doc.art_path) {
    const { data: artFile } = await supabaseAdmin()
      .storage.from("art")
      .download(doc.art_path);
    if (artFile) {
      try {
        const merged = await PDFDocument.load(pdfBytes);
        const art = await PDFDocument.load(await artFile.arrayBuffer());
        const pages = await merged.copyPages(art, art.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
        pdfBytes = await merged.save();
      } catch {
        // ART ilegível — devolve o PMOC sem anexo
      }
    }
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pmoc-${id}.pdf"`,
    },
  });
}
