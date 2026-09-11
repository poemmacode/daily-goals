"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "El enlace no traía código de acceso. Pide uno nuevo.",
  exchange_failed: "El enlace expiró o ya fue usado. Pide uno nuevo.",
};

function UrlError() {
  const params = useSearchParams();
  const code = params.get("error");
  if (!code) return null;
  return (
    <p className="mt-4 rounded-xl bg-red-100 p-3 text-center text-sm text-red-800 dark:bg-red-950 dark:text-red-300">
      {ERROR_MESSAGES[code] ?? "No se pudo completar el inicio de sesión."}
    </p>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold">🎯 Daily Goals</h1>
      <p className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
        Tus rutinas diarias, con timer de enfoque y rachas.
      </p>
      <Suspense>
        <UrlError />
      </Suspense>
      {sent ? (
        <p className="mt-8 rounded-xl bg-green-100 p-4 text-center text-green-800 dark:bg-green-950 dark:text-green-300">
          Revisa tu correo: te enviamos un enlace para entrar. ✉️
        </p>
      ) : (
        <form onSubmit={handleLogin} className="mt-8 flex w-full flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="rounded-xl border border-zinc-300 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Entrar con enlace mágico"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </main>
  );
}
