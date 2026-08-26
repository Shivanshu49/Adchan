#!/usr/bin/env python3
"""Generate committed Hindi TTS assets from the shared failure taxonomy."""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
FAILURES_SOURCE = ROOT / "shared" / "failures.json"
OUTPUT_DIR = ROOT / "web" / "public" / "audio"
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"

# Sarvam's current docs no longer list the requested legacy "meera" voice.
# ritu is a supported Hindi female voice on the current Bulbul model.
MODEL = "bulbul:v3"
LANGUAGE_CODE = "hi-IN"
SPEAKER = "ritu"


def load_failures() -> list[dict[str, Any]]:
    payload = json.loads(FAILURES_SOURCE.read_text(encoding="utf-8"))
    failures = payload.get("failures")
    if not isinstance(failures, list) or len(failures) != 12:
        raise ValueError("shared/failures.json must contain exactly 12 failures")
    return failures


def synthesize(text: str, api_key: str) -> bytes:
    body = json.dumps(
        {
            "text": text,
            "language_code": LANGUAGE_CODE,
            "speaker": SPEAKER,
            "model": MODEL,
            "pace": 0.9,
            "speech_sample_rate": 24000,
            "output_audio_codec": "mp3",
        },
        ensure_ascii=False,
    ).encode("utf-8")
    request = urllib.request.Request(
        SARVAM_TTS_URL,
        data=body,
        headers={
            "api-subscription-key": api_key,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Sarvam TTS returned HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"Sarvam TTS request failed: {error.reason}") from error

    audios = result.get("audios") if isinstance(result, dict) else None
    if not isinstance(audios, list) or not audios or not isinstance(audios[0], str):
        raise RuntimeError("Sarvam TTS response did not contain an audio payload")
    try:
        audio = base64.b64decode(audios[0], validate=True)
    except ValueError as error:
        raise RuntimeError("Sarvam TTS returned invalid base64 audio") from error
    if not audio:
        raise RuntimeError("Sarvam TTS returned an empty audio file")
    return audio


def write_atomic(path: Path, data: bytes) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_bytes(data)
    temporary.replace(path)


def display_path(path: Path) -> Path:
    try:
        return path.relative_to(ROOT)
    except ValueError:
        return path


def generate(force: bool) -> tuple[int, int]:
    api_key = os.environ.get("SARVAM_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY is required to generate audio")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    generated = 0
    skipped = 0
    for failure in load_failures():
        code = failure["code"]
        sources = [("plain", failure["plain"]["hi"])]
        if failure["script"]["hi"].strip() != "—":
            sources.append(("script", failure["script"]["hi"]))

        for kind, text in sources:
            target = OUTPUT_DIR / f"{code}_{kind}.mp3"
            if target.exists() and not force:
                print(f"skip {display_path(target)}")
                skipped += 1
                continue
            print(f"generate {display_path(target)}")
            write_atomic(target, synthesize(text, api_key))
            generated += 1
    return generated, skipped


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--force",
        action="store_true",
        help="regenerate files that already exist",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        generated, skipped = generate(force=args.force)
    except (KeyError, TypeError, ValueError, RuntimeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    print(f"Audio complete: {generated} generated, {skipped} skipped.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
