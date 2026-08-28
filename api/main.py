import os
import re
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AnyHttpUrl, BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import HTMLResponse, JSONResponse

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
    close_tracker_pool,
    delete_tracker_session,
    ensure_tracker_record,
    get_tracker_record,
    initialize_tracker_pool,
    mark_tracker_done,
    set_tracker_reminder,
)


API_VERSION = "0.1.0"
STATIC_JOURNEY_MESSAGE = (
    "आवाज़ और लिखी शिकायत की ऑनलाइन जाँच अभी उपलब्ध नहीं है। "
    "नीचे दिए नमूना नंबरों से तैयार निदान और अगला कदम अभी भी देख सकते हैं।"
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


class TrackerResetResponse(BaseModel):
    cleared: int


settings = Settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    del app
    if settings.database_url:
        try:
            await initialize_tracker_pool(settings.database_url)
        except TrackerStorageError:
            # Static diagnosis stays available; the tracker retries on first use.
            pass
    try:
        yield
    finally:
        await close_tracker_pool()


app = FastAPI(
    title="Adchan API",
    debug=False,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    lifespan=lifespan,
)
app.state.limiter = limiter


async def rate_limit_exceeded_handler(request: Request, error: RateLimitExceeded):
    del request, error
    demo_url = f'{str(settings.vercel_origin).rstrip("/")}/#demo-numbers'
    return HTMLResponse(
        status_code=429,
        content=f"""<!doctype html>
<html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>थोड़ी देर बाद कोशिश करें · अड़चन</title>
<style>body{{margin:0;background:#faf8f5;color:#1a1a1a;font:19px/1.6 sans-serif}}main,header,footer{{max-width:560px;margin:auto;padding:24px 20px}}main{{min-height:55vh}}section{{border:2px solid #c1272d;background:#fff;padding:20px}}a{{color:inherit;font-weight:700}}small{{font-size:15px}}</style>
</head><body><header><strong>अड़चन</strong><br><small>स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।</small></header>
<main><section><h1>एक मिनट में बहुत ज़्यादा कोशिशें हुईं</h1><p>ऑनलाइन आवाज़ और लिखी शिकायत की जाँच कुछ देर के लिए रोकी गई है। इससे आपका कोई डेटा नहीं खोया।</p><p>तैयार नमूना निदान, अगला कार्यालय और दस्तावेज़ अभी भी पूरी तरह काम करते हैं।</p><p><a href="{demo_url}">आठ नमूना नंबरों से निदान देखें</a></p></section></main>
<footer>स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।</footer></body></html>""",
    )


async def http_exception_handler(request: Request, error: StarletteHTTPException):
    del request
    messages = {
        404: "माँगी गई जानकारी नहीं मिली। तैयार नमूना निदान अभी भी देख सकते हैं।",
        405: "यह तरीका उपलब्ध नहीं है। तैयार नमूना निदान अभी भी देख सकते हैं।",
        413: "आवाज़ की फ़ाइल बहुत बड़ी है। लिखकर बताएँ या तैयार नमूना निदान देखें।",
        422: "भेजी गई जानकारी पूरी या सही नहीं है। उसे जाँचें; तैयार नमूना निदान अभी भी काम करता है।",
        503: STATIC_JOURNEY_MESSAGE,
    }
    message = messages.get(error.status_code, "अनुरोध पूरा नहीं हो पाया। तैयार नमूना निदान अभी भी काम करता है।")
    return JSONResponse(status_code=error.status_code, content={"detail": message})


async def validation_exception_handler(request: Request, error: RequestValidationError):
    del request, error
    return JSONResponse(
        status_code=422,
        content={
            "detail": "भेजी गई जानकारी पूरी या सही नहीं है। उसे जाँचें; तैयार नमूना निदान अभी भी काम करता है।"
        },
    )


async def unexpected_exception_handler(request: Request, error: Exception):
    del request, error
    return JSONResponse(status_code=500, content={"detail": STATIC_JOURNEY_MESSAGE})


app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unexpected_exception_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(settings.vercel_origin).rstrip("/")],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
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
        raise HTTPException(status_code=503, detail=STATIC_JOURNEY_MESSAGE)
    return settings.database_url


async def run_tracker_operation(operation) -> TrackerResponse:
    try:
        record = await operation
    except TrackerStorageError as error:
        raise HTTPException(status_code=503, detail=STATIC_JOURNEY_MESSAGE) from error
    return tracker_response(record)


def deployment_commit() -> str:
    for name in (
        "GIT_COMMIT_SHA",
        "SOURCE_VERSION",
        "VERCEL_GIT_COMMIT_SHA",
        "RENDER_GIT_COMMIT",
    ):
        candidate = os.getenv(name, "").strip()
        if re.fullmatch(r"[0-9a-fA-F]{7,64}", candidate):
            return candidate.lower()

    image_ref = os.getenv("FLY_IMAGE_REF", "")
    image_digest = re.search(r"sha256:([0-9a-fA-F]{64})", image_ref)
    return image_digest.group(1).lower() if image_digest else "local"


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": "Adchan API", "health": "/health"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": API_VERSION, "commit": deployment_commit()}


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
        raise HTTPException(status_code=503, detail=STATIC_JOURNEY_MESSAGE) from error
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
        raise HTTPException(status_code=422, detail="याद दिलाने की तारीख़ ज़रूरी है।")
    return await run_tracker_operation(
        set_tracker_reminder(
            tracker_database_url(),
            session_id,
            reg_no,
            payload.failureCode.value,
            payload.reminderAt,
        )
    )


@app.delete("/tracker/session", response_model=TrackerResetResponse)
async def reset_tracker_session(
    session_id: Annotated[UUID, Header(alias="X-Session-ID")],
) -> TrackerResetResponse:
    try:
        cleared = await delete_tracker_session(tracker_database_url(), session_id)
    except TrackerStorageError as error:
        raise HTTPException(status_code=503, detail=STATIC_JOURNEY_MESSAGE) from error
    return TrackerResetResponse(cleared=cleared)


@app.post("/diagnose", response_model=DiagnoseResponse)
@limiter.limit("20/minute")
async def diagnose(request: Request, payload: DiagnoseRequest) -> DiagnoseResponse:
    del request
    try:
        result = await classify_complaint(
            payload.complaint,
            payload.lang,
            api_key=settings.llm_api_key,
            base_url=str(settings.llm_base_url),
            model=settings.llm_model,
            top_confidence_threshold=settings.llm_top_confidence_threshold,
            confidence_gap_threshold=settings.llm_confidence_gap_threshold,
        )
    except Exception as error:
        raise HTTPException(status_code=503, detail=STATIC_JOURNEY_MESSAGE) from error
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
        message = (
            "आवाज़ की फ़ाइल बहुत बड़ी है। लिखकर बताएँ या तैयार नमूना निदान देखें।"
            if status_code == 413
            else "आवाज़ की रिकॉर्डिंग सही नहीं मिली। लिखकर बताएँ या तैयार नमूना निदान देखें।"
        )
        raise HTTPException(status_code=status_code, detail=message) from error
    except TranscriptionUnavailableError as error:
        raise HTTPException(status_code=503, detail=STATIC_JOURNEY_MESSAGE) from error
    finally:
        await audio.close()
    return TranscribeResponse(text=result.text, provider=result.provider)
