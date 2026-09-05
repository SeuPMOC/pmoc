"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [orgNome, setOrgNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      if (modo === "criar") {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { org_name: orgNome } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (error) throw error;
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha na autenticação");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">SeuPMOC</h1>
        <p className="text-sm text-neutral-500">
          Emissão e controle do Plano de Manutenção, Operação e Controle
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        {modo === "criar" && (
          <input
            required
            placeholder="Nome da sua empresa"
            className="rounded border px-3 py-2"
            value={orgNome}
            onChange={(e) => setOrgNome(e.target.value)}
          />
        )}
        <input
          required
          type="email"
          placeholder="E-mail"
          className="rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Senha"
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
          {carregando ? "..." : modo === "criar" ? "Criar conta" : "Entrar"}
        </button>
      </form>

      <button
        onClick={() => setModo(modo === "criar" ? "entrar" : "criar")}
        className="text-sm text-neutral-500 underline"
      >
        {modo === "criar"
          ? "Já tenho conta"
          : "Criar conta para minha empresa"}
      </button>
    </main>
  );
}
