import { useState, useCallback, useRef } from "react";

export type ResearchChunk = {
  sub_q_id: string;
  summary: string;
  confidence: number;
  sources: string[];
  key_points: string[];
};

export type ResearchState = {
  jobId: string | null;
  status: "idle" | "pending" | "running" | "done" | "error";
  chunks: ResearchChunk[];
  synthesis: string;
  error: string | null;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function useResearch() {
  const [state, setState] = useState<ResearchState>({
    jobId: null,
    status: "idle",
    chunks: [],
    synthesis: "",
    error: null,
  });

  const esRef = useRef<EventSource | null>(null);

  const submit = useCallback(async (query: string) => {
    // Close any existing SSE connection
    esRef.current?.close();

    setState({ jobId: null, status: "pending", chunks: [], synthesis: "", error: null });

    // ── POST /research → get job_id immediately ──────────────────────────
    let jobId: string;
    try {
      const res = await fetch(`${API}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      jobId = data.job_id;
    } catch (e: unknown) {
      setState(s => ({ ...s, status: "error", error: String(e) }));
      return;
    }

    setState(s => ({ ...s, jobId, status: "running" }));

    // ── Open SSE stream — tokens arrive token-by-token ───────────────────
    const es = new EventSource(`${API}/stream/${jobId}`);
    esRef.current = es;

    es.onmessage = (e) => {
      setState(s => ({ ...s, synthesis: s.synthesis + e.data }));
    };

    es.addEventListener("done", () => {
      es.close();
      // Fetch the full structured report once synthesis is complete
      fetch(`${API}/report/${jobId}`)
        .then(r => r.json())
        .then(report => {
          setState(s => ({
            ...s,
            status: "done",
            chunks: report.chunks,
            synthesis: report.synthesis,
          }));
        })
        .catch(() => setState(s => ({ ...s, status: "done" })));
    });

    es.onerror = () => {
      es.close();
      setState(s => ({ ...s, status: "error", error: "Stream connection lost." }));
    };
  }, []);

  const reset = useCallback(() => {
    esRef.current?.close();
    setState({ jobId: null, status: "idle", chunks: [], synthesis: "", error: null });
  }, []);

  return { ...state, submit, reset };
}