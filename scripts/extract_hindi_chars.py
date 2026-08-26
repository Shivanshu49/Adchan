#!/usr/bin/env python3
"""Write the exact Devanagari character inventory used by shared copy."""

from __future__ import annotations

import argparse
import json
import unicodedata
from collections.abc import Iterable
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCES = (ROOT / "shared" / "failures.json", ROOT / "shared" / "personas.json")
DEFAULT_OUTPUT = ROOT / "hindi-chars.txt"
DIGITS = "0123456789०१२३४५६७८९"
BASIC_PUNCTUATION = " .,;:!?-–—/()[]{}'\"“”‘’…·+%=₹\n"


def strings(value: object) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield key
            yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


def devanagari_characters(paths: Iterable[Path]) -> set[str]:
    characters: set[str] = set(DIGITS + BASIC_PUNCTUATION)
    for path in paths:
        payload = json.loads(path.read_text(encoding="utf-8"))
        for text in strings(payload):
            characters.update(
                character
                for character in text
                if unicodedata.name(character, "").startswith("DEVANAGARI")
            )
    return characters


def sort_key(character: str) -> tuple[int, str]:
    return (ord(character), character)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    characters = devanagari_characters(SOURCES)
    args.output.write_text("".join(sorted(characters, key=sort_key)), encoding="utf-8")
    print(f"Wrote {len(characters)} unique characters to {args.output}")


if __name__ == "__main__":
    main()
