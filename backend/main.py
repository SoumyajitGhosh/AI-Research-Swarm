import uuid
import asyncio
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from models.request import ResearchRequest, JobStatus
from models.research import FinalReport
from services.swarm import run_swarm
from store.job_store import job_store, stream_queues

app = FastAPI(title="AI Research Swarm")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/research", response_model=JobStatus)
async def start_research(req: ResearchRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    job_store[job_id] = {"status": "pending", "report": None}
    stream_queues[job_id] = asyncio.Queue()
    background_tasks.add_task(run_swarm, job_id, req.query)
    return JobStatus(job_id=job_id, status="pending")


@app.get("/status/{job_id}", response_model=JobStatus)
async def get_status(job_id: str):
    entry = job_store.get(job_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatus(job_id=job_id, status=entry["status"])


@app.get("/stream/{job_id}")
async def stream_synthesis(job_id: str):
    if job_id not in stream_queues:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_gen():
        q = stream_queues[job_id]
        while True:
            token = await q.get()
            if token is None:          # sentinel — stream done
                yield {"event": "done", "data": ""}
                break
            yield {"data": token}

    return EventSourceResponse(event_gen())


@app.get("/report/{job_id}", response_model=FinalReport)
async def get_report(job_id: str):
    entry = job_store.get(job_id)
    if not entry or entry["status"] != "done":
        raise HTTPException(status_code=404, detail="Report not ready")
    return entry["report"]