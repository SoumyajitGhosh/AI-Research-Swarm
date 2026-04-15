import asyncio
import json
from models.research import ResearchChunk, FinalReport
from services.llm import decompose_query, answer_sub_question, stream_synthesis
from store.job_store import job_store, stream_queues

# Max concurrent LLM calls — respects API rate limits
CONCURRENCY = 5


async def run_swarm(job_id: str, query: str):
    job_store[job_id]["status"] = "running"
    q = stream_queues[job_id]

    try:
        # ── Step 1: Decompose query into 20 sub-questions ──────────────────
        raw_sub_qs = await decompose_query(query)

        # ── Step 2: Fan out with gather + Semaphore ─────────────────────────
        sem = asyncio.Semaphore(CONCURRENCY)

        async def bounded_call(sub_q: dict) -> ResearchChunk:
            async with sem:
                raw = await answer_sub_question(sub_q)
                # Force validated, typed output via Pydantic V2
                return ResearchChunk.model_validate(raw)

        chunks: list[ResearchChunk] = await asyncio.gather(
            *[bounded_call(sq) for sq in raw_sub_qs],
            return_exceptions=False,
        )

        # ── Step 3: Stream synthesis tokens into the SSE queue ──────────────
        synthesis_text = ""
        async for token in stream_synthesis(query, [c.model_dump() for c in chunks]):
            synthesis_text += token
            await q.put(token)          # each token → SSE client

        # ── Step 4: Persist final report ────────────────────────────────────
        report = FinalReport(
            job_id=job_id,
            query=query,
            chunks=chunks,
            synthesis=synthesis_text,
        )
        job_store[job_id]["report"] = report
        job_store[job_id]["status"] = "done"

    except Exception as e:
        job_store[job_id]["status"] = "error"
        job_store[job_id]["error"] = str(e)

    finally:
        await q.put(None)               # sentinel → close SSE stream