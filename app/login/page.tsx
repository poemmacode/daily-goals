"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const [mode, setMode] = useState<"magic" | "password">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
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

  async function handlePassword(e: React.FormEvent, action: "signin" | "signup") {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } =
      action === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      // Confirmación de email activada en Supabase: debe validar su correo.
      setSent(true);
    }
  }

  const inputCls =
    "rounded-xl border border-zinc-300 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900";

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
        <div className="mt-8 flex w-full flex-col gap-3">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
            {(
              [
                ["password", "Contraseña"],
                ["magic", "Enlace mágico"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  mode === m
                    ? "bg-white shadow dark:bg-zinc-800"
                    : "text-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "magic" ? (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className={inputCls}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Enviando…" : "Enviar enlace mágico"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className={inputCls}
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => void handlePassword(e, "signin")}
                  className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? "…" : "Entrar"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => void handlePassword(e, "signup")}
                  className="rounded-xl border border-indigo-600 px-4 py-3 font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 disabled:opacity-50"
                >
                  Crear cuenta
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </main>
  );
}
