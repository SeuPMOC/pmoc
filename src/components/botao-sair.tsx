"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function BotaoSair() {
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    try {
      await supabaseBrowser().auth.signOut();
    } finally {
      // navegação completa: garante que o servidor veja os cookies já limpos
      window.location.href = "/";
    }
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      className="rounded border px-3 py-1 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
    >
      {saindo ? "Saindo…" : "Sair"}
    </button>
  );
}
