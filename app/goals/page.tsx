"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/lib/types";
import { linkify } from "@/lib/linkify";
import { useLang } from "@/lib/i18n";
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
  const { t } = useLang();

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

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  // Cerrar el modal con Escape sin perder la posición de scroll.
  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm]);

  async function handleSubmit(values: GoalFormValues) {
    if (values.end_date < values.start_date) {
      setError(t.goals.endBeforeStart);
      return;
    }
    if (values.active_days.length === 0) {
      setError(t.goals.pickDay);
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError(t.goals.invalidSession);
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
    closeForm();
    reload();
  }

  async function archive(id: string, archived: boolean) {    const supabase = createClient();
    await supabase.from("goals").update({ archived, updated_at: new Date().toISOString() }).eq("id", id);
    reload();
  }

  async function remove(id: string) {
    if (!confirm(t.goals.confirmDelete)) return;
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    reload();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.goals.title}</h1>
        <button
          onClick={() => { setEditing(null); setError(null); setShowForm(true); }}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          {t.goals.new}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            aria-label={t.goals.close}
            onClick={closeForm}
            className="absolute inset-0 cursor-default bg-black/50"
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? t.goals.editTitle : t.goals.newTitle}
              </h2>
              <button
                onClick={closeForm}
                aria-label={t.goals.closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>
            <GoalForm
              initial={editing}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              saving={saving}
              error={error}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-center text-zinc-500">{t.goals.loading}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {goals.map((g) => (
            <li key={g.id} className={`rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 ${g.archived ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                <div className="flex-1">
                  <p className="font-semibold">{g.title}</p>
                  <p className="text-xs text-zinc-500">
                    {g.allocated_minutes} {t.today.min} · {g.start_date} → {g.end_date} · {t.goals.daysPerWeek(g.active_days.length)}
                  </p>
                </div>
              </div>
              {g.notes && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:underline">
                    {t.goals.notesToggle}
                  </summary>
                  <p className="mt-1 whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-300">
                    {linkify(g.notes)}
                  </p>
                </details>
              )}
              <div className="mt-3 flex gap-2 text-sm">
                <button
                  onClick={() => { setEditing(g); setError(null); setShowForm(true); }}
                  className="rounded-lg px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {t.goals.edit}
                </button>
                <button
                  onClick={() => void archive(g.id, !g.archived)}
                  className="rounded-lg px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {g.archived ? t.goals.reactivate : t.goals.archive}
                </button>
                <button
                  onClick={() => void remove(g.id)}
                  className="rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  {t.goals.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
