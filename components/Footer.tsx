"use client";

import { useLang } from "@/lib/i18n";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 px-4 pb-24 pt-6 text-sm text-zinc-500 md:pb-6">
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">
          {t.footer.tagline}
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/in/emma-estrada-oficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            in LinkedIn
          </a>
          <span aria-hidden>·</span>
          <a
            href="mailto:poemmaestrada@gmail.com"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ✉️ poemmaestrada@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
