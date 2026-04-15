"use client";
type Props = { text: string; streaming: boolean };

export default function StreamView({ text, streaming }: Props) {
  return (
    <div className="rounded-xl border bg-muted/40 p-5 space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Synthesis {streaming && <span className="animate-pulse">●</span>}
      </h2>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {text}
        {streaming && <span className="inline-block w-0.5 h-4 bg-foreground ml-0.5 animate-pulse" />}
      </p>
    </div>
  );
}
