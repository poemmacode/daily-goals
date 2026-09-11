import React from "react";

const URL_RE = /(https?:\/\/[^\s<>"')\]]+)/g;
const URL_TEST = /(https?:\/\/[^\s<>"')\]]+)/;

/** Convierte URLs en enlaces clicables (nueva pestaña), resto como texto. */
export function linkify(text: string): React.ReactNode[] {
  const parts = text.split(URL_RE);
  return parts.map((part, i) =>
    URL_TEST.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-medium text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}
