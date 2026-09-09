import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/supabase/auth";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Exporta todos os dados de um estabelecimento (LGPD — portabilidade).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user } = await requireStaff();

  try {
    await rateLimit(`export:${user.id}`, 10, 300);
  } catch (e) {
    if (e instanceof RateLimitError)
      return NextResponse.json({ error: e.message }, { status: 429 });
    throw e;
  }

  // RLS garante que só sai dado do próprio org
  const { data: cliente } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!cliente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const [units, equipamentos, ordens, laudos, pmocs] = await Promise.all([
    supabase.from("units").select("*").eq("client_id", id),
    supabase.from("equipment").select("*, maintenance_plan_items(*)").eq("client_id", id),
    supabase.from("maintenance_orders").select("*").eq("client_id", id),
    supabase.from("air_quality_readings").select("*").eq("client_id", id),
    supabase.from("pmoc_documents").select("*").eq("client_id", id),
  ]);

  const dump = {
    exportadoEm: new Date().toISOString(),
    cliente,
    ambientes: units.data ?? [],
    equipamentos: equipamentos.data ?? [],
    ordens_de_servico: ordens.data ?? [],
    laudos_qualidade_ar: laudos.data ?? [],
    pmocs: pmocs.data ?? [],
  };

  return new NextResponse(JSON.stringify(dump, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="seupmoc-${id}.json"`,
    },
  });
}
