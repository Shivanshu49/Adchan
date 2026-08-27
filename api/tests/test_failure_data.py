import json
from pathlib import Path

from failure_data import FAILURES


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_generated_failure_data_matches_shared_source() -> None:
    source = json.loads(
        (REPO_ROOT / "shared" / "failures.json").read_text(encoding="utf-8")
    )["failures"]

    assert list(FAILURES) == source
