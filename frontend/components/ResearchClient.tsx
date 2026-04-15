"use client";

import { useResearch } from "@/hooks/useResearch";
import SearchBar from "./Searchbar";
import StreamView from "./StreamView";
import ChunkCard from "./ChunkCard";
import StatusBadge from "./StatusBadge";

export default function ResearchClient() {
  const { status, chunks, synthesis, error, jobId, submit, reset } = useResearch();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">AI Research Swarm</h1>
        <p className="text-muted-foreground text-sm">
          Fires 20 parallel LLM calls, validates with Pydantic, streams synthesis via SSE.
        </p>
      </header>

      <SearchBar onSubmit={submit} disabled={status === "running" || status === "pending"} />

      {status !== "idle" && (
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {jobId && (
            <span className="text-xs text-muted-foreground font-mono">job: {jobId.slice(0, 8)}…</span>
          )}
          {(status === "done" || status === "error") && (
            <button
              onClick={reset}
              className="ml-auto text-xs underline text-muted-foreground hover:text-foreground"
            >
              New search
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Live synthesis stream */}
      {(status === "running" || status === "done") && synthesis && (
        <StreamView text={synthesis} streaming={status === "running"} />
      )}

      {/* Structured chunk cards — appear after done */}
      {status === "done" && chunks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Research chunks ({chunks.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {chunks.map(c => (
              <ChunkCard key={c.sub_q_id} chunk={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}