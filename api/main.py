from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    vercel_origin: AnyHttpUrl


settings = Settings()
app = FastAPI(title="Adchan API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(settings.vercel_origin).rstrip("/")],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
