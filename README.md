# AI-Research-Swarm

You type a research question. The system fans out 20+ parallel async LLM calls (each tackling a sub-question), validates every response into a strict Pydantic schema, then streams the aggregated report to a frontend via SSE — letter by letter.



## Architecture Overview

1. FastAPI Backend

POST /research — accepts a question, spawns the swarm
GET /stream/{job_id} — SSE endpoint that streams the final report
GET /status/{job_id} — returns structured job metadata (Pydantic-validated)

2. Asyncio Engine

Decomposes the question into 20 sub-questions using an LLM
Fires all 20 calls via asyncio.gather()
A Semaphore(5) caps concurrent calls at 5 to respect rate limits
Results are collected and merged into a synthesis prompt

3. Pydantic V2 Schemas

SubQuestion(BaseModel) — validates each decomposed question
ResearchChunk(BaseModel) — validates each LLM's answer (has confidence: float, sources: list[str], summary: str)
FinalReport(BaseModel) — the merged, typed output with metadata

4. SSE Streaming

The synthesis LLM call streams tokens
FastAPI pushes each token as an SSE event to the frontend
A minimal HTML+JS frontend renders it live


## What You'll Deeply Learn

| Concept | Where it appears |
|---------|------------------|
| `asyncio.gather` | Firing 20 LLM calls in parallel |
| `asyncio.Semaphore` | Rate-limit guard on the swarm |
| Pydantic V2 `model_validate` | Parsing LLM JSON into typed objects |
| FastAPI SSE | Streaming synthesis to frontend |
| Background Tasks | Running the swarm after returning a job ID |