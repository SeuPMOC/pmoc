"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ConfirmeEmailPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [msg, setMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function reenviar() {
    setCarregando(true);
    setMsg(null);
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) {
      router.replace("/login");
      return;
    }
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setMsg(error ? error.message : "E-mail reenviado. Confira sua caixa de entrada.");
    setCarregando(false);
  }

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Confirme seu e-mail</h1>
      <p className="text-sm text-neutral-600">
        Enviamos um link de confirmação para o seu e-mail. Clique nele para
        liberar o acesso. Depois, atualize esta página.
      </p>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      <div className="flex flex-col gap-2">
        <button
          onClick={reenviar}
          disabled={carregando}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {carregando ? "..." : "Reenviar e-mail"}
        </button>
        <button onClick={() => router.refresh()} className="text-sm underline">
          Já confirmei — atualizar
        </button>
        <button onClick={sair} className="text-sm text-neutral-500 underline">
          Sair
        </button>
      </div>
    </main>
  );
}
