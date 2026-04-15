from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=5, max_length=500)


class JobStatus(BaseModel):
    job_id: str
    status: str   # pending | running | done | error