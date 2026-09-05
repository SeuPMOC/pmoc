"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ResetSenhaPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Ao chegar pelo link do e-mail, o Supabase já autentica a sessão de
  // recuperação via hash da URL — só falta salvar a nova senha.
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setOk(true);
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 1500);
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível redefinir a senha. Peça um novo link.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Nova senha</h1>
        <p className="text-sm text-neutral-500">Defina uma nova senha para sua conta.</p>
      </div>

      {ok ? (
        <p className="text-sm text-green-700">Senha atualizada! Entrando...</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            required
            type="password"
            placeholder="Nova senha"
            minLength={6}
            className="rounded border px-3 py-2"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button
            disabled={carregando}
            className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          >
            {carregando ? "..." : "Salvar nova senha"}
          </button>
        </form>
      )}
    </main>
  );
}
