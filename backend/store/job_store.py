import asyncio

# { job_id: { "status": str, "report": FinalReport | None } }
job_store: dict = {}

# { job_id: asyncio.Queue }  —  synthesis tokens are pushed here
stream_queues: dict[str, asyncio.Queue] = {}