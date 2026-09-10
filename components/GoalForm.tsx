"use client";

import { useState } from "react";
import { GOAL_COLORS, WEEKDAYS, type Goal } from "@/lib/types";
import { toLocalDateKey } from "@/lib/dates";

export interface GoalFormValues {
  title: string;
  allocated_minutes: number;
  start_date: string;
  end_date: string;
  active_days: number[];
  category: string;
  color: string;
}

interface Props {
  initial?: Goal | null;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}

export function GoalForm({ initial, onSubmit, onCancel, saving, error }: Props) {
  const today = toLocalDateKey();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [minutes, setMinutes] = useState(initial?.allocated_minutes ?? 30);
  const [start, setStart] = useState(initial?.start_date ?? today);
  const [end, setEnd] = useState(initial?.end_date ?? today);
  const [days, setDays] = useState<number[]>(initial?.active_days ?? [0, 1, 2, 3, 4, 5, 6]);
  const [category, setCategory] = useState(initial?.category ?? "general");
  const [color, setColor] = useState(initial?.color ?? GOAL_COLORS[0]);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      allocated_minutes: minutes,
      start_date: start,
      end_date: end,
      active_days: days,
      category: category.trim() || "general",
      color,
    });
  }

  const inputCls =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} placeholder="Ej. Leer 30 minutos" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Minutos asignados</label>
          <input className={inputCls} type="number" min={1} max={1440} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Categoría</label>
          <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} maxLength={50} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Inicio</label>
          <input className={inputCls} type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Fin</label>
          <input className={inputCls} type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Días activos</label>
        <div className="flex gap-2">
          {WEEKDAYS.map((name, d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`h-9 w-9 rounded-full text-xs font-semibold ${
                days.includes(d)
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Color</label>
        <div className="flex gap-2">
          {GOAL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-zinc-500" : ""}`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear objetivo"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-zinc-300 px-4 py-2.5 dark:border-zinc-700">
          Cancelar
        </button>
      </div>
    </form>
  );
}
