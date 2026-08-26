#!/usr/bin/env python3
"""Run the Adchan classifier against a fixed, source-labelled evaluation set."""

from __future__ import annotations

import argparse
import asyncio
import json
import random
import sys
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


API_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = API_ROOT.parent
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from engine import (  # noqa: E402
    DEFAULT_CONFIDENCE_GAP_THRESHOLD,
    DEFAULT_TOP_CONFIDENCE_THRESHOLD,
    INSUFFICIENT_INFO,
    DiagnosisResult,
    FAILURE_CODES,
    classify_complaint,
)


AMBIGUOUS = "AMBIGUOUS"
CLARIFY = "CLARIFY"
TOP_CONFIDENCE_SWEEP = tuple(round(0.50 + step * 0.05, 2) for step in range(9))
CONFIDENCE_GAP_SWEEP = tuple(round(0.05 + step * 0.05, 2) for step in range(6))


class EvalSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=API_ROOT / ".env", extra="ignore")

    llm_base_url: str
    llm_api_key: str
    llm_model: str
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


@dataclass(frozen=True)
class EvalCase:
    id: str
    complaint: str
    lang: str
    expected: str
    source: str


@dataclass(frozen=True)
class Prediction:
    id: str
    expected: str
    source: str
    code: str
    top_code: str | None
    top_confidence: float
    second_code: str | None
    second_confidence: float
    confidence_gap: float
    valid_response: bool
    deployed_needs_clarification: bool


def load_failures(path: Path = REPO_ROOT / "shared" / "failures.json") -> dict[str, dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    return {failure["code"]: failure for failure in payload["failures"]}


def load_cases(path: Path) -> list[EvalCase]:
    cases: list[EvalCase] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            payload = json.loads(line)
            cases.append(EvalCase(**payload))
        except (json.JSONDecodeError, TypeError) as error:
            raise ValueError(f"invalid case on line {line_number}: {error}") from error
    validate_cases(cases)
    return cases


def validate_cases(cases: list[EvalCase]) -> None:
    if not cases:
        raise ValueError("evaluation set is empty")

    ids = [case.id for case in cases]
    duplicates = sorted(case_id for case_id, count in Counter(ids).items() if count > 1)
    if duplicates:
        raise ValueError(f"duplicate case ids: {', '.join(duplicates)}")

    allowed_expected = set(FAILURE_CODES) | {AMBIGUOUS}
    invalid_expected = sorted({case.expected for case in cases} - allowed_expected)
    if invalid_expected:
        raise ValueError(f"invalid expected codes: {', '.join(invalid_expected)}")

    for case in cases:
        if case.lang not in {"hi", "hi-en"}:
            raise ValueError(f"{case.id}: lang must be hi or hi-en")
        if not case.complaint.strip():
            raise ValueError(f"{case.id}: complaint is empty")
        if case.source not in {"synthetic", "field"}:
            raise ValueError(f"{case.id}: source must be synthetic or field")

    if len(cases) == 60 and all(case.source == "synthetic" for case in cases):
        counts = Counter(case.expected for case in cases)
        underrepresented = [code for code in FAILURE_CODES if counts[code] < 3]
        if underrepresented:
            raise ValueError(f"failure codes with fewer than 3 cases: {', '.join(underrepresented)}")
        if counts[AMBIGUOUS] != 6:
            raise ValueError("the 60-case synthetic seed set must contain exactly 6 ambiguous cases")


def select_cases(
    cases: list[EvalCase],
    *,
    tag: str | None,
    sample: int | None,
    seed: int,
) -> list[EvalCase]:
    sources = {case.source for case in cases}
    if tag is None and len(sources) > 1:
        raise ValueError(
            "evaluation file contains multiple source tags; pass --tag to avoid mixing provenance"
        )
    selected = [case for case in cases if tag is None or case.source == tag]
    if not selected:
        raise ValueError(f"no cases matched source tag {tag!r}")
    if sample is not None:
        if sample < 1:
            raise ValueError("--sample must be at least 1")
        if sample < len(selected):
            selected = random.Random(seed).sample(selected, sample)
    return selected


async def collect_predictions(
    cases: list[EvalCase],
    settings: EvalSettings,
    *,
    concurrency: int,
) -> list[Prediction]:
    semaphore = asyncio.Semaphore(concurrency)
    predictions: dict[str, Prediction] = {}

    async with httpx.AsyncClient(timeout=20.0) as client:
        async def classify(case: EvalCase) -> None:
            async with semaphore:
                result: DiagnosisResult = await classify_complaint(
                    case.complaint,
                    "hi",
                    api_key=settings.llm_api_key,
                    base_url=settings.llm_base_url,
                    model=settings.llm_model,
                    top_confidence_threshold=settings.llm_top_confidence_threshold,
                    confidence_gap_threshold=settings.llm_confidence_gap_threshold,
                    client=client,
                )
                predictions[case.id] = Prediction(
                    id=case.id,
                    expected=case.expected,
                    source=case.source,
                    code=result.code,
                    top_code=result.top_code,
                    top_confidence=result.confidence,
                    second_code=result.second_code,
                    second_confidence=result.second_confidence,
                    confidence_gap=result.confidence_gap,
                    valid_response=result.valid_response,
                    deployed_needs_clarification=result.needs_clarification,
                )

        await asyncio.gather(*(classify(case) for case in cases))

    return [predictions[case.id] for case in cases]


def routed_label(
    prediction: Prediction,
    top_confidence_threshold: float,
    confidence_gap_threshold: float,
) -> str:
    if (
        not prediction.valid_response
        or prediction.top_code == INSUFFICIENT_INFO
        or prediction.top_code not in FAILURE_CODES
        or prediction.top_confidence < top_confidence_threshold
        or prediction.confidence_gap < confidence_gap_threshold
    ):
        return CLARIFY
    return prediction.top_code


def safe_ratio(numerator: int, denominator: int) -> float:
    return numerator / denominator if denominator else 0.0


def calculate_metrics(
    predictions: list[Prediction],
    failures: dict[str, dict[str, Any]],
    top_confidence_threshold: float,
    confidence_gap_threshold: float,
) -> dict[str, Any]:
    labels = {
        prediction.id: routed_label(
            prediction,
            top_confidence_threshold,
            confidence_gap_threshold,
        )
        for prediction in predictions
    }
    determinate = [prediction for prediction in predictions if prediction.expected != AMBIGUOUS]
    ambiguous = [prediction for prediction in predictions if prediction.expected == AMBIGUOUS]

    correct = sum(
        labels[prediction.id] == (CLARIFY if prediction.expected == AMBIGUOUS else prediction.expected)
        for prediction in predictions
    )
    classification_correct = sum(labels[prediction.id] == prediction.expected for prediction in determinate)
    clarification_count = sum(label == CLARIFY for label in labels.values())
    ambiguous_clarified = sum(labels[prediction.id] == CLARIFY for prediction in ambiguous)

    per_code: dict[str, dict[str, float | int]] = {}
    for code in FAILURE_CODES:
        true_positive = sum(
            prediction.expected == code and labels[prediction.id] == code
            for prediction in predictions
        )
        predicted_count = sum(labels[prediction.id] == code for prediction in predictions)
        expected_count = sum(prediction.expected == code for prediction in predictions)
        per_code[code] = {
            "precision": safe_ratio(true_positive, predicted_count),
            "recall": safe_ratio(true_positive, expected_count),
            "support": expected_count,
            "predicted": predicted_count,
        }

    expected_labels = list(FAILURE_CODES) + [AMBIGUOUS]
    predicted_labels = list(FAILURE_CODES) + [CLARIFY]
    confusion = {
        expected: {
            predicted: sum(
                prediction.expected == expected and labels[prediction.id] == predicted
                for prediction in predictions
            )
            for predicted in predicted_labels
        }
        for expected in expected_labels
    }

    routed_determinate = [
        prediction for prediction in determinate if labels[prediction.id] in FAILURE_CODES
    ]
    misrouted = sum(
        failures[labels[prediction.id]]["office"] != failures[prediction.expected]["office"]
        for prediction in routed_determinate
    )

    return {
        "top_confidence_threshold": top_confidence_threshold,
        "confidence_gap_threshold": confidence_gap_threshold,
        "case_count": len(predictions),
        "determinate_count": len(determinate),
        "ambiguous_count": len(ambiguous),
        "overall_accuracy": safe_ratio(correct, len(predictions)),
        "classification_accuracy": safe_ratio(classification_correct, len(determinate)),
        "clarification_rate": safe_ratio(clarification_count, len(predictions)),
        "ambiguous_clarification_rate": safe_ratio(ambiguous_clarified, len(ambiguous)),
        "routed_determinate_count": len(routed_determinate),
        "route_coverage": safe_ratio(len(routed_determinate), len(determinate)),
        "misroute_count": misrouted,
        "misroute_rate": safe_ratio(misrouted, len(determinate)),
        "misroute_rate_among_routed": safe_ratio(misrouted, len(routed_determinate)),
        "per_code": per_code,
        "confusion_matrix": confusion,
    }


def threshold_sweep(
    predictions: list[Prediction],
    failures: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    return [
        calculate_metrics(
            predictions,
            failures,
            top_confidence_threshold,
            confidence_gap_threshold,
        )
        for top_confidence_threshold in TOP_CONFIDENCE_SWEEP
        for confidence_gap_threshold in CONFIDENCE_GAP_SWEEP
    ]


def recommend_threshold(sweep: list[dict[str, Any]]) -> dict[str, Any]:
    signatures = {
        (
            point["overall_accuracy"],
            point["clarification_rate"],
            point["misroute_rate"],
        )
        for point in sweep
    }
    if len(signatures) == 1:
        return {
            "top_confidence_threshold": DEFAULT_TOP_CONFIDENCE_THRESHOLD,
            "confidence_gap_threshold": DEFAULT_CONFIDENCE_GAP_THRESHOLD,
            "status": "inconclusive",
            "reason": (
                "Every threshold pair produced identical results, so the confidence and margin "
                "cutoffs cannot be calibrated from this run."
            ),
        }

    eligible = [point for point in sweep if point["misroute_rate"] <= 0.10]
    candidates = eligible or sweep
    chosen = max(
        candidates,
        key=lambda point: (
            point["overall_accuracy"],
            -point["clarification_rate"],
            -abs(
                point["top_confidence_threshold"]
                - DEFAULT_TOP_CONFIDENCE_THRESHOLD
            ),
            -abs(
                point["confidence_gap_threshold"]
                - DEFAULT_CONFIDENCE_GAP_THRESHOLD
            ),
        ),
    )
    return {
        "top_confidence_threshold": chosen["top_confidence_threshold"],
        "confidence_gap_threshold": chosen["confidence_gap_threshold"],
        "status": "recommended",
        "reason": (
            "Highest overall accuracy among thresholds at or below 10% misroute rate, "
            "breaking ties in favor of fewer clarifications."
        ),
    }


def confidence_diagnostics(predictions: list[Prediction]) -> dict[str, Any]:
    valid = [prediction for prediction in predictions if prediction.valid_response]
    determinate = [
        prediction
        for prediction in valid
        if prediction.expected != AMBIGUOUS and prediction.top_code in FAILURE_CODES
    ]
    correct = [
        prediction.top_confidence
        for prediction in determinate
        if prediction.top_code == prediction.expected
    ]
    incorrect = [
        prediction.top_confidence
        for prediction in determinate
        if prediction.top_code != prediction.expected
    ]
    top_confidences = [prediction.top_confidence for prediction in valid]

    def mean(values: list[float]) -> float | None:
        return sum(values) / len(values) if values else None

    high_confidence_rate = safe_ratio(
        sum(confidence >= 0.9 for confidence in top_confidences),
        len(top_confidences),
    )
    incorrect_high_confidence_rate = safe_ratio(
        sum(confidence >= 0.9 for confidence in incorrect),
        len(incorrect),
    )
    clustered_high_regardless_of_correctness = (
        len(valid) >= 10
        and bool(incorrect)
        and high_confidence_rate >= 0.8
        and incorrect_high_confidence_rate >= 0.8
    )
    return {
        "valid_response_count": len(valid),
        "refusal_count": sum(
            prediction.top_code == INSUFFICIENT_INFO for prediction in valid
        ),
        "top_confidence_min": min(top_confidences) if top_confidences else None,
        "top_confidence_mean": mean(top_confidences),
        "top_confidence_max": max(top_confidences) if top_confidences else None,
        "top_confidence_at_least_0_9_rate": high_confidence_rate,
        "correct_top_confidence_mean": mean(correct),
        "incorrect_top_confidence_mean": mean(incorrect),
        "incorrect_top_confidence_at_least_0_9_rate": incorrect_high_confidence_rate,
        "clustered_high_regardless_of_correctness": clustered_high_regardless_of_correctness,
    }


def percentage(value: float) -> str:
    return f"{value * 100:6.1f}%"


def print_confusion_matrix(metrics: dict[str, Any]) -> None:
    columns = list(FAILURE_CODES) + [CLARIFY]
    abbreviations = {label: f"C{index + 1:02d}" for index, label in enumerate(FAILURE_CODES)}
    abbreviations[AMBIGUOUS] = "AMB"
    abbreviations[CLARIFY] = "ASK"
    header = "expected\\pred " + " ".join(f"{abbreviations[column]:>3}" for column in columns)
    print("\nConfusion matrix")
    print(header)
    print("-" * len(header))
    for expected in list(FAILURE_CODES) + [AMBIGUOUS]:
        cells = " ".join(
            f"{metrics['confusion_matrix'][expected][column]:>3}" for column in columns
        )
        print(f"{abbreviations[expected]:>13} {cells}")
    print("\nLegend")
    for code in FAILURE_CODES:
        print(f"  {abbreviations[code]}  {code}")
    print("  AMB  AMBIGUOUS expected")
    print("  ASK  clarification requested")


def print_report(
    metrics: dict[str, Any],
    sweep: list[dict[str, Any]],
    recommendation: dict[str, Any],
    diagnostics: dict[str, Any],
) -> None:
    print(
        "\nOperating thresholds: "
        f"top confidence {metrics['top_confidence_threshold']:.2f}, "
        f"confidence gap {metrics['confidence_gap_threshold']:.2f}"
    )
    print(f"Overall accuracy:       {percentage(metrics['overall_accuracy'])}")
    print(f"Classification accuracy:{percentage(metrics['classification_accuracy'])}")
    print(f"Clarification rate:     {percentage(metrics['clarification_rate'])}")
    print(f"Ambiguous asked:        {percentage(metrics['ambiguous_clarification_rate'])}")
    print(
        "MISROUTE RATE:        "
        f"{percentage(metrics['misroute_rate'])} "
        f"({metrics['misroute_count']}/{metrics['determinate_count']} determinate cases)"
    )
    print(
        "Misroute among routed:"
        f"{percentage(metrics['misroute_rate_among_routed'])} "
        f"({metrics['routed_determinate_count']} routed)"
    )

    print("\nPer-code precision / recall")
    print(f"{'code':32} {'precision':>9} {'recall':>9} {'support':>7}")
    print("-" * 62)
    for code in FAILURE_CODES:
        values = metrics["per_code"][code]
        print(
            f"{code:32} {percentage(values['precision']):>9} "
            f"{percentage(values['recall']):>9} {values['support']:>7}"
        )

    print_confusion_matrix(metrics)
    print("\nSelf-reported confidence diagnostics")
    print(f"Valid structured responses: {diagnostics['valid_response_count']}")
    print(f"Explicit refusals:          {diagnostics['refusal_count']}")
    if diagnostics["valid_response_count"]:
        print(
            "Top confidence min/mean/max: "
            f"{diagnostics['top_confidence_min']:.3f} / "
            f"{diagnostics['top_confidence_mean']:.3f} / "
            f"{diagnostics['top_confidence_max']:.3f}"
        )
        print(
            "Top confidence >=0.90:       "
            f"{percentage(diagnostics['top_confidence_at_least_0_9_rate'])}"
        )
        print(
            "Correct / incorrect mean:    "
            f"{diagnostics['correct_top_confidence_mean']} / "
            f"{diagnostics['incorrect_top_confidence_mean']}"
        )
        if diagnostics["clustered_high_regardless_of_correctness"]:
            print(
                "WARNING: confidence is clustered at 0.90+ even on incorrect predictions; "
                "self-reported confidence is not calibrated on this baseline."
            )
    else:
        print("No valid scores were returned; calibration cannot be assessed.")

    print("\nTop-confidence and gap threshold sweep")
    print(
        f"{'top':>5} {'gap':>5} {'accuracy':>10} {'clarify':>10} "
        f"{'misroute':>10} {'coverage':>10}"
    )
    print("-" * 58)
    for point in sweep:
        print(
            f"{point['top_confidence_threshold']:>5.2f} "
            f"{point['confidence_gap_threshold']:>5.2f} "
            f"{percentage(point['overall_accuracy']):>10} "
            f"{percentage(point['clarification_rate']):>10} "
            f"{percentage(point['misroute_rate']):>10} "
            f"{percentage(point['route_coverage']):>10}"
        )
    print(
        "\nThreshold recommendation: "
        f"top {recommendation['top_confidence_threshold']:.2f}, "
        f"gap {recommendation['confidence_gap_threshold']:.2f} "
        f"({recommendation['status']})\n{recommendation['reason']}"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cases", type=Path, default=Path(__file__).with_name("cases.jsonl"))
    parser.add_argument("--sample", type=int, help="evaluate a deterministic sample of N cases")
    parser.add_argument("--tag", help="only evaluate cases with this source tag")
    parser.add_argument("--seed", type=int, default=2026, help="sampling seed")
    parser.add_argument("--concurrency", type=int, default=5)
    parser.add_argument(
        "--confidence-threshold",
        "--threshold",
        dest="confidence_threshold",
        type=float,
        help="override LLM_TOP_CONFIDENCE_THRESHOLD for the operating report",
    )
    parser.add_argument(
        "--gap-threshold",
        type=float,
        help="override LLM_CONFIDENCE_GAP_THRESHOLD for the operating report",
    )
    parser.add_argument(
        "--fail-misroute-rate",
        type=float,
        help="exit non-zero when the operating-threshold misroute rate exceeds this fraction",
    )
    parser.add_argument("--no-write", action="store_true", help="do not write a timestamped result")
    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    if args.concurrency < 1:
        raise ValueError("--concurrency must be at least 1")
    if args.confidence_threshold is not None and not 0 <= args.confidence_threshold <= 1:
        raise ValueError("--confidence-threshold must be between 0 and 1")
    if args.gap_threshold is not None and not 0 <= args.gap_threshold <= 1:
        raise ValueError("--gap-threshold must be between 0 and 1")
    if args.fail_misroute_rate is not None and not 0 <= args.fail_misroute_rate <= 1:
        raise ValueError("--fail-misroute-rate must be between 0 and 1")


def main() -> int:
    args = parse_args()
    validate_args(args)
    all_cases = load_cases(args.cases)
    cases = select_cases(all_cases, tag=args.tag, sample=args.sample, seed=args.seed)
    failures = load_failures()
    settings = EvalSettings()
    operating_top_threshold = (
        args.confidence_threshold
        if args.confidence_threshold is not None
        else settings.llm_top_confidence_threshold
    )
    operating_gap_threshold = (
        args.gap_threshold
        if args.gap_threshold is not None
        else settings.llm_confidence_gap_threshold
    )

    print(
        f"Evaluating {len(cases)} cases with {settings.llm_model} "
        f"({args.tag or 'all sources'}, concurrency={args.concurrency})"
    )
    predictions = asyncio.run(
        collect_predictions(cases, settings, concurrency=args.concurrency)
    )
    metrics = calculate_metrics(
        predictions,
        failures,
        operating_top_threshold,
        operating_gap_threshold,
    )
    sweep = threshold_sweep(predictions, failures)
    recommendation = recommend_threshold(sweep)
    diagnostics = confidence_diagnostics(predictions)
    print_report(metrics, sweep, recommendation, diagnostics)

    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    result = {
        "timestamp": timestamp,
        "model": settings.llm_model,
        "base_url": settings.llm_base_url,
        "case_file": str(args.cases),
        "source_tags": sorted({case.source for case in cases}),
        "sample": args.sample,
        "metrics": metrics,
        "threshold_sweep": sweep,
        "threshold_recommendation": recommendation,
        "confidence_diagnostics": diagnostics,
        "predictions": [asdict(prediction) for prediction in predictions],
    }
    if not args.no_write:
        results_dir = Path(__file__).with_name("results")
        results_dir.mkdir(parents=True, exist_ok=True)
        result_path = results_dir / f"{timestamp}.json"
        result_path.write_text(
            json.dumps(result, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"\nWrote {result_path}")

    if args.fail_misroute_rate is not None:
        if metrics["routed_determinate_count"] == 0:
            print("ERROR: no determinate case was routed; refusing a false-green misroute gate", file=sys.stderr)
            return 2
        if metrics["misroute_rate"] > args.fail_misroute_rate:
            print(
                f"ERROR: misroute rate {metrics['misroute_rate']:.3f} exceeds "
                f"{args.fail_misroute_rate:.3f}",
                file=sys.stderr,
            )
            return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, OSError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(2) from error
