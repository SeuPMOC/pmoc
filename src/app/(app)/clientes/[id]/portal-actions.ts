"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isStaff } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Cria um login de portal para o estabelecimento preencher os próprios dados.
export async function criarAcessoPortal(clientId: string, f: FormData) {
  const { supabase, user, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");

  const email = String(f.get("email")).trim().toLowerCase();
  const senha = String(f.get("senha"));
  if (senha.length < 6) throw new Error("Senha muito curta (mínimo 6).");

  // valida que o cliente é da org do usuário
  const { data: client } = await supabase
    .from("clients")
    .select("id, razao_social")
    .eq("id", clientId)
    .single();
  if (!client) throw new Error("Cliente não encontrado");

  const admin = supabaseAdmin();

  const { data: inv, error: invErr } = await supabase
    .from("client_portal_invites")
    .insert({
      org_id: profile.org_id,
      client_id: clientId,
      email,
      criado_por: user.id,
    })
    .select("token")
    .single();
  if (invErr) throw invErr;

  const { error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: {
      invite_token: inv.token,
      full_name: client.razao_social,
    },
  });
  if (error) {
    await supabase.from("client_portal_invites").delete().eq("token", inv.token);
    throw error;
  }

  revalidatePath(`/clientes/${clientId}`);
}

export async function removerAcessoPortal(clientId: string, profileId: string) {
  const { profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");

  const admin = supabaseAdmin();
  // confere que o profile pertence à mesma org e ao cliente
  const { data: alvo } = await admin
    .from("profiles")
    .select("id, org_id, client_id, role")
    .eq("id", profileId)
    .single();
  if (!alvo || alvo.org_id !== profile.org_id || alvo.client_id !== clientId || alvo.role !== "client") {
    throw new Error("Acesso inválido");
  }
  await admin.auth.admin.deleteUser(profileId);
  revalidatePath(`/clientes/${clientId}`);
}
