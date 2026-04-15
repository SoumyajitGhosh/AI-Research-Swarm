"use client";
import { useState, KeyboardEvent } from "react";

type Props = { onSubmit: (q: string) => void; disabled?: boolean };

export default function SearchBar({ onSubmit, disabled }: Props) {
  const [val, setVal] = useState("");

  const submit = () => {
    const q = val.trim();
    if (q.length < 5 || disabled) return;
    onSubmit(q);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="flex gap-2 items-end">
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={onKey}
        rows={3}
        disabled={disabled}
        placeholder="Enter a research question… (e.g. 'How does the immune system fight viral infections?')"
        className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />
      <button
        onClick={submit}
        disabled={disabled || val.trim().length < 5}
        className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground
                   hover:bg-primary/90 disabled:opacity-40 transition-colors"
      >
        Research
      </button>
    </div>
  );
}






