"use client";

import { useState } from "react";
import { GOAL_TEMPLATES, TEMPLATE_CATEGORIES, type GoalTemplate } from "@/lib/templates";
import { useLang } from "@/lib/i18n";

interface TemplateModalProps {
  onSelect: (template: GoalTemplate) => void;
  onClose: () => void;
}

export function TemplateModal({ onSelect, onClose }: TemplateModalProps) {
  const { lang } = useLang();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const templates = selectedCategory
    ? GOAL_TEMPLATES.filter((t) => t.category === selectedCategory)
    : GOAL_TEMPLATES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />
      <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {lang === "es" ? "Plantillas de Objetivos" : "Goal Templates"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            ✕
          </button>
        </div>

        {/* Category filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              !selectedCategory
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {lang === "es" ? "Todos" : "All"}
          </button>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {cat.icon} {lang === "es" ? cat.label.es : cat.label.en}
            </button>
          ))}
        </div>

        {/* Templates list */}
        <ul className="space-y-2">
          {templates.map((tpl) => (
            <li key={tpl.id}>
              <button
                onClick={() => onSelect(tpl)}
                className="w-full rounded-xl border border-zinc-200 p-4 text-left hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
              >
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: tpl.color }} />
                  <div className="flex-1">
                    <p className="font-semibold">{tpl.title}</p>
                    <p className="text-xs text-zinc-500">
                      {tpl.allocated_minutes} min · {tpl.active_days.length} days/wk · {tpl.category}
                    </p>
                  </div>
                </div>
                {tpl.notes && (
                  <p className="mt-1 text-xs text-zinc-500">{tpl.notes}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
