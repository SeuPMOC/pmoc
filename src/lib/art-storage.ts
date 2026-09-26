import { supabaseAdmin } from "./supabase/admin";

// PDFs de ART na tabela art_files (0011), via service role — no lugar do
// bucket 'art' do Supabase Storage. ponytail: base64 no Postgres serve para
// PDFs de até ~10 MB; migrar p/ armazenamento de objetos se o volume crescer.

export async function salvarArt(orgId: string, artPath: string, file: File) {
  const content_b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const { error } = await supabaseAdmin()
    .from("art_files")
    .upsert({ path: artPath, org_id: orgId, content_b64, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function lerArt(artPath: string): Promise<Buffer | null> {
  const { data } = await supabaseAdmin()
    .from("art_files")
    .select("content_b64")
    .eq("path", artPath)
    .maybeSingle();
  return data ? Buffer.from(data.content_b64, "base64") : null;
}
