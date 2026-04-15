import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()  # Loads .env file

client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "gpt-4o-2024-08-06"  # Equivalent to Claude Sonnet (smart & fast) [web:17][web:72]


async def decompose_query(query: str) -> list[dict]:
    """Ask the LLM to break the query into 20 focused sub-questions."""
    system = (
        "You are a research decomposition engine. "
        "Given a research query, return ONLY a valid JSON object — no markdown, no commentary. "
        "Schema: {\"sub_questions\": [{\"id\": \"sq_1\", \"question\": \"...\", \"focus_area\": \"...\"}]}"
        " Generate exactly 20 sub-questions."
    )
    msg = await client.chat.completions.create(
        model=MODEL,
        max_tokens=2048,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Research query: {query}"}
        ],
    )
    raw = msg.choices[0].message.content.strip()
    data = json.loads(raw)
    return data["sub_questions"]


async def answer_sub_question(sub_q: dict) -> dict:
    """Answer a single sub-question and return a typed ResearchChunk dict."""
    system = (
        "You are a precise research assistant. "
        "Return ONLY a valid JSON object — no markdown, no commentary. "
        "Schema: {"
        "\"sub_q_id\": \"<id>\", "
        "\"summary\": \"<2-3 sentence answer>\", "
        "\"confidence\": <0.0-1.0>, "
        "\"sources\": [\"<plausible source>\"], "
        "\"key_points\": [\"<point1>\", \"<point2>\"]"
        "}"
    )
    prompt = (
        f"Sub-question ID: {sub_q['id']}\n"
        f"Focus area: {sub_q['focus_area']}\n"
        f"Question: {sub_q['question']}"
    )
    msg = await client.chat.completions.create(
        model=MODEL,
        max_tokens=512,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ],
    )
    raw = msg.choices[0].message.content.strip()
    return json.loads(raw)


async def stream_synthesis(query: str, chunks: list[dict]):
    """Stream a synthesis narrative token by token; yields str tokens."""
    chunk_summaries = "\n".join(
        f"- [{c['sub_q_id']}] {c['summary']}" for c in chunks
    )
    system = (
        "You are a senior research analyst. "
        "Synthesise the provided research chunks into a coherent, insightful report. "
        "Write in flowing prose. Be concise but thorough."
    )
    prompt = (
        f"Original research query: {query}\n\n"
        f"Research chunk summaries:\n{chunk_summaries}\n\n"
        "Write the synthesis report:"
    )
    stream = await client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ],
        stream=True,
    )
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content