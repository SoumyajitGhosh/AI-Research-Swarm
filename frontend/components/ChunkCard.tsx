import { ResearchChunk } from "@/hooks/useResearch";

export default function ChunkCard({ chunk }: { chunk: ResearchChunk }) {
  const pct = Math.round(chunk.confidence * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-400";

  return (
    <div className="rounded-xl border bg-background p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">{chunk.sub_q_id}</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-xs text-muted-foreground">{pct}% confidence</span>
        </div>
      </div>

      <p className="leading-relaxed">{chunk.summary}</p>

      {chunk.key_points.length > 0 && (
        <ul className="space-y-1 text-muted-foreground">
          {chunk.key_points.map((pt, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 text-primary">▸</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}

      {chunk.sources.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {chunk.sources.map((s, i) => (
            <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
