# Adchan API

Install and run the development server:

```bash
uv sync
cp .env.example .env
uv run uvicorn main:app --reload
```

Apply the idempotent tracker schema with `uv run python apply_schema.py`.

Production runs from `Dockerfile` on Fly.io in `bom`, with one machine kept
running. Set `VERCEL_ORIGIN=https://adchan-web.vercel.app` plus the keys listed
in `.env.example` as Fly secrets. Set `GIT_COMMIT_SHA` on each deployment so
`/health` identifies the deployed source revision.
