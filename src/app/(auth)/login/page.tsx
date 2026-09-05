"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [modo, setModo] = useState<"entrar" | "criar" | "recuperar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [orgNome, setOrgNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      if (modo === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-senha`,
        });
        if (error) throw error;
        setAviso("Se esse e-mail tiver conta, enviamos um link para redefinir a senha.");
        return;
      }
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
        {modo !== "recuperar" && (
          <input
            required
            type="password"
            placeholder="Senha"
            minLength={6}
            className="rounded border px-3 py-2"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        )}
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {aviso && <p className="text-sm text-green-700">{aviso}</p>}
        <button
          disabled={carregando}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {carregando
            ? "..."
            : modo === "criar"
              ? "Criar conta"
              : modo === "recuperar"
                ? "Enviar link de recuperação"
                : "Entrar"}
        </button>
      </form>

      <div className="flex flex-col gap-1 text-sm text-neutral-500">
        <button
          onClick={() => {
            setModo(modo === "criar" ? "entrar" : "criar");
            setErro(null);
            setAviso(null);
          }}
          className="underline"
        >
          {modo === "criar" ? "Já tenho conta" : "Criar conta para minha empresa"}
        </button>
        {modo !== "criar" && (
          <button
            onClick={() => {
              setModo(modo === "recuperar" ? "entrar" : "recuperar");
              setErro(null);
              setAviso(null);
            }}
            className="text-left underline"
          >
            {modo === "recuperar" ? "Voltar ao login" : "Esqueci minha senha"}
          </button>
        )}
      </div>
    </main>
  );
}
