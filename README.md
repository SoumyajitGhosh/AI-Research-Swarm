# AI-Research-Swarm
You type a research question. The system fans out 20+ parallel async LLM calls (each tackling a sub-question), validates every response into a strict Pydantic schema, then streams the aggregated report to a frontend via SSE — letter by letter.
