import { createClient } from "@supabase/supabase-js";

// Cliente com service role — SÓ em server actions/rotas, nunca no browser.
// Ignora RLS. Usado para criar logins de portal do cliente.
export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
