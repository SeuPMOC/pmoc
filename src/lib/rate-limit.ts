import { supabaseAdmin } from "./supabase/admin";

export class RateLimitError extends Error {
  constructor() {
    super("Muitas requisições em pouco tempo. Tente de novo em instantes.");
    this.name = "RateLimitError";
  }
}

// Janela fixa. `bucket` identifica o alvo (ex.: `pdf:<user_id>`).
// Lança RateLimitError se estourar. Falha do limitador não bloqueia o request.
export async function rateLimit(bucket: string, max: number, windowSec = 60) {
  const ms = windowSec * 1000;
  const windowStart = new Date(Math.floor(Date.now() / ms) * ms).toISOString();
  try {
    const { data, error } = await supabaseAdmin().rpc("bump_rate_limit", {
      p_bucket: bucket,
      p_window: windowStart,
    });
    if (error) return; // limitador indisponível — não derruba o request
    if (typeof data === "number" && data > max) throw new RateLimitError();
  } catch (e) {
    if (e instanceof RateLimitError) throw e;
    // erro de rede/etc. no limitador: ignora
  }
}
