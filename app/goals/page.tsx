"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/lib/types";
import { GoalForm, type GoalFormValues } from "@/components/GoalForm";

async function fetchGoals(): Promise<Goal[]> {
  const supabase = createClient();
  const { data } = await supabase.from("goals").select("*").order("created_at");
  return (data as Goal[] | null) ?? [];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchGoals().then((data) => {
      if (ignore) return;
      setGoals(data);
      setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  function reload() {
    fetchGoals().then(setGoals);
  }

  async function handleSubmit(values: GoalFormValues) {
    if (values.end_date < values.start_date) {
      setError("La fecha de fin no puede ser anterior al inicio.");
      return;
    }
    if (values.active_days.length === 0) {
      setError("Selecciona al menos un día activo.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesión no válida. Vuelve a entrar.");
      setSaving(false);
      return;
    }

    const payload = { ...values, user_id: user.id };
    const result = editing
      ? await supabase.from("goals").update({ ...values, updated_at: new Date().toISOString() }).eq("id", editing.id)
      : await supabase.from("goals").insert(payload);

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setShowForm(false);
    setEditing(null);
    reload();
  }

  async function archive(id: string, archived: boolean) {
    const supabase = createClient();
    await supabase.from("goals").update({ archived, updated_at: new Date().toISOString() }).eq("id", id);
    reload();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este objetivo y su historial?")) return;
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    reload();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Objetivos</h1>
        <button
          onClick={() => { setEditing(null); setError(null); setShowForm(true); }}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + Nuevo
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <GoalForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            saving={saving}
            error={error}
          />
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-center text-zinc-500">Cargando…</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {goals.map((g) => (
            <li key={g.id} className={`rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 ${g.archived ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                <div className="flex-1">
                  <p className="font-semibold">{g.title}</p>
                  <p className="text-xs text-zinc-500">
                    {g.allocated_minutes} min · {g.start_date} → {g.end_date} · {g.active_days.length} días/sem
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-sm">
                <button
                  onClick={() => { setEditing(g); setError(null); setShowForm(true); }}
                  className="rounded-lg px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Editar
                </button>
                <button
                  onClick={() => void archive(g.id, !g.archived)}
                  className="rounded-lg px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {g.archived ? "Reactivar" : "Archivar"}
                </button>
                <button
                  onClick={() => void remove(g.id)}
                  className="rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
