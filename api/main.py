from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AnyHttpUrl, BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from models import FailureCode
from engine import (
    DEFAULT_CONFIDENCE_GAP_THRESHOLD,
    DEFAULT_TOP_CONFIDENCE_THRESHOLD,
    MAX_AUDIO_BYTES,
    AudioInput,
    AudioValidationError,
    TranscriptionUnavailableError,
    classify_complaint,
    transcribe_audio,
)
from tracker import (
    TrackerRecord,
    TrackerStorageError,
    ensure_tracker_record,
    get_tracker_record,
    mark_tracker_done,
    set_tracker_reminder,
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    vercel_origin: AnyHttpUrl
    sarvam_api_key: str | None = None
    stt_fallback_api_key: str | None = None
    llm_base_url: AnyHttpUrl
    llm_api_key: str
    llm_model: str
    database_url: str | None = None
    llm_top_confidence_threshold: float = Field(
        default=DEFAULT_TOP_CONFIDENCE_THRESHOLD,
        ge=0.0,
        le=1.0,
    )
    llm_confidence_gap_threshold: float = Field(
        default=DEFAULT_CONFIDENCE_GAP_THRESHOLD,
        ge=0.0,
        le=1.0,
    )


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


class TrackerWriteRequest(BaseModel):
    failureCode: FailureCode
    reminderAt: datetime | None = None


class TrackerResponse(BaseModel):
    sessionId: UUID
    regNo: str
    failureCode: FailureCode
    markedDoneAt: datetime | None
    reminderAt: datetime | None
    createdAt: datetime


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
    allow_headers=["Accept", "Content-Type", "X-Session-ID"],
)


def tracker_response(record: TrackerRecord) -> TrackerResponse:
    return TrackerResponse(
        sessionId=record.session_id,
        regNo=record.reg_no,
        failureCode=FailureCode(record.failure_code),
        markedDoneAt=record.marked_done_at,
        reminderAt=record.reminder_at,
        createdAt=record.created_at,
    )


def tracker_database_url() -> str:
    if not settings.database_url:
        raise HTTPException(status_code=503, detail="Tracker database is not configured")
    return settings.database_url


async def run_tracker_operation(operation) -> TrackerResponse:
    try:
        record = await operation
    except TrackerStorageError as error:
        raise HTTPException(status_code=503, detail="Tracker is temporarily unavailable") from error
    return tracker_response(record)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/tracker/{reg_no}", response_model=TrackerResponse)
async def create_tracker(
    reg_no: str,
    payload: TrackerWriteRequest,
    session_id: Annotated[UUID, Header(alias="X-Session-ID")],
) -> TrackerResponse:
    return await run_tracker_operation(
        ensure_tracker_record(
            tracker_database_url(),
            session_id,
            reg_no,
            payload.failureCode.value,
        )
    )


@app.get("/tracker/{reg_no}", response_model=TrackerResponse)
async def read_tracker(
    reg_no: str,
    session_id: Annotated[UUID, Header(alias="X-Session-ID")],
) -> TrackerResponse:
    try:
        record = await get_tracker_record(tracker_database_url(), session_id, reg_no)
    except TrackerStorageError as error:
        raise HTTPException(status_code=503, detail="Tracker is temporarily unavailable") from error
    if record is None:
        raise HTTPException(status_code=404, detail="Tracker record not found")
    return tracker_response(record)


@app.post("/tracker/{reg_no}/done", response_model=TrackerResponse)
async def mark_done(
    reg_no: str,
    payload: TrackerWriteRequest,
    session_id: Annotated[UUID, Header(alias="X-Session-ID")],
) -> TrackerResponse:
    return await run_tracker_operation(
        mark_tracker_done(
            tracker_database_url(),
            session_id,
            reg_no,
            payload.failureCode.value,
        )
    )


@app.post("/tracker/{reg_no}/reminder", response_model=TrackerResponse)
async def save_reminder(
    reg_no: str,
    payload: TrackerWriteRequest,
    session_id: Annotated[UUID, Header(alias="X-Session-ID")],
) -> TrackerResponse:
    if payload.reminderAt is None:
        raise HTTPException(status_code=422, detail="reminderAt is required")
    return await run_tracker_operation(
        set_tracker_reminder(
            tracker_database_url(),
            session_id,
            reg_no,
            payload.failureCode.value,
            payload.reminderAt,
        )
    )


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
        top_confidence_threshold=settings.llm_top_confidence_threshold,
        confidence_gap_threshold=settings.llm_confidence_gap_threshold,
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
