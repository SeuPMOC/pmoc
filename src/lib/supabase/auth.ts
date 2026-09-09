import { redirect } from "next/navigation";
import { supabaseServer } from "./server";

// Retorna { supabase, user, profile } ou redireciona p/ login.
export async function requireUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Com "Confirm email" ligado no Supabase, e-mail não confirmado não passa.
  // (Se estiver desligado, o Supabase já marca email_confirmed_at no signup.)
  if (!user.email_confirmed_at) redirect("/confirme-email");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, full_name, client_id")
    .single();

  if (!profile) redirect("/login");
  return { supabase, user, profile };
}

export const isStaff = (role: string) => role === "owner" || role === "tech";

// Exige que quem chamou seja owner/tech da própria empresa (não cliente-portal).
export async function requireStaff() {
  const ctx = await requireUser();
  if (!isStaff(ctx.profile.role)) throw new Error("Sem permissão");
  return ctx;
}

// Portal do cliente final: exige role='client' e um client_id vinculado.
export async function requireClient() {
  const { supabase, user, profile } = await requireUser();
  if (profile.role !== "client" || !profile.client_id) redirect("/dashboard");
  return { supabase, user, profile, clientId: profile.client_id as string };
}

// Você, dono do SeuPMOC — não um cliente da plataforma. Allowlist por e-mail
// via env, checado no servidor. ponytail: um usuário só; virar tabela de
// papéis se um dia mais gente da sua equipe precisar do /admin.
export function isPlatformAdmin(email: string | null | undefined) {
  const admins = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && admins.includes(email.toLowerCase());
}

export async function requirePlatformAdmin() {
  const { user } = await requireUser();
  if (!isPlatformAdmin(user.email)) redirect("/dashboard");
  return { user };
}
