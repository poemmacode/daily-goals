"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MissReason } from "@/lib/types";
import { MISS_REASON_LABELS } from "@/lib/types";
import { useLang } from "@/lib/i18n";

interface MissReasonPromptProps {
  goalId: string;
  goalTitle: string;
  missDate: string;
  onDismiss: () => void;
  onSaved: () => void;
}

const REASON_KEYS: MissReason[] = [
  "no_time",
  "too_tired",
  "forgot",
  "too_difficult",
  "not_motivated",
  "unexpected",
  "schedule_conflict",
  "other",
];

export function MissReasonPrompt({ goalId, goalTitle, missDate, onDismiss, onSaved }: MissReasonPromptProps) {
  const { lang, t } = useLang();
  const [selectedReason, setSelectedReason] = useState<MissReason | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!selectedReason) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("goal_misses").upsert(
      {
        goal_id: goalId,
        user_id: user.id,
        miss_date: missDate,
        reason: selectedReason,
        note: note.trim() || null,
      },
      { onConflict: "goal_id,miss_date" },
    );

    if (!error) {
      setSaved(true);
      setTimeout(onSaved, 1500);
    }
    setSaving(false);
  }

  if (saved) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950/30">
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          {lang === "es" ? "Registro guardado" : "Reason saved"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {lang === "es"
            ? `¿Por qué no completaste "${goalTitle}"?`
            : `Why did you miss "${goalTitle}"?`}
        </p>
        <button
          onClick={onDismiss}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label={t.goals.close}
        >
          ✕
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {lang === "es" ? "Opcional · Ayuda a entender patrones" : "Optional · Helps identify patterns"}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {REASON_KEYS.map((key) => {
          const label = MISS_REASON_LABELS[key][lang];
          const isSelected = selectedReason === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedReason(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {selectedReason === "other" && (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={lang === "es" ? "Cuéntanos más..." : "Tell us more..."}
          className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          maxLength={200}
        />
      )}

      {selectedReason && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? (lang === "es" ? "Guardando..." : "Saving...") : (lang === "es" ? "Guardar" : "Save")}
          </button>
          <button
            onClick={onDismiss}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            {lang === "es" ? "Saltar" : "Skip"}
          </button>
        </div>
      )}
    </div>
  );
}
