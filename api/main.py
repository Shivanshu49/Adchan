from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AnyHttpUrl, BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from engine import (
    MAX_AUDIO_BYTES,
    AudioInput,
    AudioValidationError,
    TranscriptionUnavailableError,
    classify_complaint,
    transcribe_audio,
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    vercel_origin: AnyHttpUrl
    sarvam_api_key: str | None = None
    stt_fallback_api_key: str | None = None
    llm_base_url: AnyHttpUrl
    llm_api_key: str
    llm_model: str


class DiagnoseRequest(BaseModel):
    complaint: str = Field(min_length=1, max_length=4000)
    lang: Literal["hi", "en"] = "hi"


class DiagnoseResponse(BaseModel):
    code: str
    confidence: float
    needsClarification: bool
    clarifyingQuestion: str | None = None


class TranscribeResponse(BaseModel):
    text: str
    provider: Literal["sarvam", "openai"]


settings = Settings()
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Adchan API")
app.state.limiter = limiter


async def rate_limit_exceeded_handler(request: Request, error: RateLimitExceeded):
    return _rate_limit_exceeded_handler(request, error)


app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(settings.vercel_origin).rstrip("/")],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Accept", "Content-Type"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/diagnose", response_model=DiagnoseResponse)
@limiter.limit("20/minute")
async def diagnose(request: Request, payload: DiagnoseRequest) -> DiagnoseResponse:
    del request
    result = await classify_complaint(
        payload.complaint,
        payload.lang,
        api_key=settings.llm_api_key,
        base_url=str(settings.llm_base_url),
        model=settings.llm_model,
    )
    return DiagnoseResponse(
        code=result.code,
        confidence=result.confidence,
        needsClarification=result.needs_clarification,
        clarifyingQuestion=result.clarifying_question,
    )


@app.post("/transcribe", response_model=TranscribeResponse)
@limiter.limit("20/minute")
async def transcribe(
    request: Request,
    audio: UploadFile = File(...),
    duration_seconds: float = Form(...),
) -> TranscribeResponse:
    del request
    data = await audio.read(MAX_AUDIO_BYTES + 1)
    upload = AudioInput(
        data=data,
        filename=audio.filename or "recording.webm",
        content_type=audio.content_type or "application/octet-stream",
        duration_seconds=duration_seconds,
    )
    try:
        result = await transcribe_audio(
            upload,
            sarvam_api_key=settings.sarvam_api_key,
            stt_fallback_api_key=settings.stt_fallback_api_key,
        )
    except AudioValidationError as error:
        status_code = 413 if len(data) > MAX_AUDIO_BYTES else 400
        raise HTTPException(status_code=status_code, detail=str(error)) from error
    except TranscriptionUnavailableError as error:
        raise HTTPException(status_code=503, detail="Transcription is temporarily unavailable") from error
    finally:
        await audio.close()
    return TranscribeResponse(text=result.text, provider=result.provider)
