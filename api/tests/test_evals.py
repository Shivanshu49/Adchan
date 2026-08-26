from collections import Counter
from dataclasses import replace
from pathlib import Path

from evals import run


CASES = Path(__file__).resolve().parents[1] / "evals" / "cases.jsonl"


def prediction(
    *,
    id: str,
    expected: str,
    top_code: str | None,
    top_confidence: float,
    second_code: str | None = "ACCOUNT_DORMANT",
    second_confidence: float = 0.1,
    valid_response: bool = True,
) -> run.Prediction:
    return run.Prediction(
        id=id,
        expected=expected,
        source="synthetic",
        code=top_code if top_code in run.FAILURE_CODES else "UNKNOWN",
        top_code=top_code,
        top_confidence=top_confidence,
        second_code=second_code,
        second_confidence=second_confidence,
        confidence_gap=max(0.0, top_confidence - second_confidence),
        valid_response=valid_response,
        deployed_needs_clarification=False,
    )


def test_seed_cases_have_required_coverage_and_provenance() -> None:
    cases = run.load_cases(CASES)
    counts = Counter(case.expected for case in cases)

    assert len(cases) == 60
    assert len({case.id for case in cases}) == 60
    assert all(case.source == "synthetic" for case in cases)
    assert counts[run.AMBIGUOUS] == 6
    assert all(counts[code] >= 3 for code in run.FAILURE_CODES)


def test_metrics_distinguish_same_office_errors_from_misroutes() -> None:
    predictions = [
        prediction(
            id="same-office",
            expected="NPCI_NOT_MAPPED",
            top_code="NAME_MISMATCH",
            top_confidence=1.0,
        ),
        prediction(
            id="different-office",
            expected="NPCI_NOT_MAPPED",
            top_code="EKYC_PENDING",
            top_confidence=1.0,
        ),
        prediction(
            id="thresholded",
            expected="EKYC_PENDING",
            top_code="EKYC_PENDING",
            top_confidence=0.6,
            second_confidence=0.2,
        ),
        prediction(
            id="ambiguous",
            expected=run.AMBIGUOUS,
            top_code=run.INSUFFICIENT_INFO,
            top_confidence=0.8,
        ),
    ]
    failures = run.load_failures()

    conservative = run.calculate_metrics(
        predictions,
        failures,
        top_confidence_threshold=0.7,
        confidence_gap_threshold=0.15,
    )
    permissive = run.calculate_metrics(
        predictions,
        failures,
        top_confidence_threshold=0.5,
        confidence_gap_threshold=0.05,
    )

    assert conservative["misroute_count"] == 1
    assert conservative["misroute_rate"] == 1 / 3
    assert conservative["ambiguous_clarification_rate"] == 1.0
    assert conservative["overall_accuracy"] == 1 / 4
    assert permissive["overall_accuracy"] == 2 / 4


def test_flat_threshold_sweep_is_reported_as_inconclusive() -> None:
    sweep = [
        {
            "top_confidence_threshold": top_threshold,
            "confidence_gap_threshold": gap_threshold,
            "overall_accuracy": 0.5,
            "clarification_rate": 0.5,
            "misroute_rate": 0.0,
        }
        for top_threshold in run.TOP_CONFIDENCE_SWEEP
        for gap_threshold in run.CONFIDENCE_GAP_SWEEP
    ]

    recommendation = run.recommend_threshold(sweep)

    assert recommendation["top_confidence_threshold"] == 0.7
    assert recommendation["confidence_gap_threshold"] == 0.15
    assert recommendation["status"] == "inconclusive"


def test_confidence_diagnostics_flag_high_confidence_errors() -> None:
    predictions = [
        prediction(
            id=f"case-{index}",
            expected="EKYC_PENDING",
            top_code="EKYC_PENDING" if index < 5 else "NPCI_NOT_MAPPED",
            top_confidence=0.95,
        )
        for index in range(10)
    ]

    diagnostics = run.confidence_diagnostics(predictions)

    assert diagnostics["top_confidence_at_least_0_9_rate"] == 1.0
    assert diagnostics["incorrect_top_confidence_at_least_0_9_rate"] == 1.0
    assert diagnostics["clustered_high_regardless_of_correctness"] is True


def test_mixed_provenance_requires_an_explicit_tag() -> None:
    cases = run.load_cases(CASES)
    mixed = [cases[0], replace(cases[1], source="field")]

    try:
        run.select_cases(mixed, tag=None, sample=None, seed=2026)
    except ValueError as error:
        assert "multiple source tags" in str(error)
    else:
        raise AssertionError("mixed source data must require --tag")

    selected = run.select_cases(mixed, tag="field", sample=None, seed=2026)
    assert [case.source for case in selected] == ["field"]
