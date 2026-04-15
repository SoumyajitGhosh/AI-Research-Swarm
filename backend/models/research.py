from pydantic import BaseModel, Field


class SubQuestion(BaseModel):
    id: str
    question: str
    focus_area: str


class SubQuestionsResponse(BaseModel):
    sub_questions: list[SubQuestion]


class ResearchChunk(BaseModel):
    sub_q_id: str
    summary: str
    confidence: float = Field(ge=0.0, le=1.0)
    sources: list[str] = Field(default_factory=list)
    key_points: list[str] = Field(default_factory=list)


class FinalReport(BaseModel):
    job_id: str
    query: str
    chunks: list[ResearchChunk]
    synthesis: str = ""