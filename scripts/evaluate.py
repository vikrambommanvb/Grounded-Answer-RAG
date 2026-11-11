#!/usr/bin/env python3
"""
THE GROUNDED ANSWER — STANDALONE BENCHMARK EVALUATION RUNNER
Executes the official 10-Question Benchmark Suite and outputs honest JSON metrics.
"""
import sys
import os
import json
import argparse
from pathlib import Path
from datetime import datetime

# Ensure backend package is in python path
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root / "backend"))

from app.evaluation.runner import run_evaluation_suite, EvaluationRunSummary
from app.evaluation.suite import TEN_QUESTION_SUITE

def main():
    parser = argparse.ArgumentParser(description="Execute the 10-Question Benchmark Suite.")
    parser.add_argument("--provider", default="mock", help="Provider to use: mock, groq")
    parser.add_argument("--output", default="data/evaluations/benchmark_results.json", help="Output path for JSON results")
    args = parser.parse_args()

    print("=" * 80)
    print("THE GROUNDED ANSWER — 10-QUESTION BENCHMARK EVALUATION SUITE")
    print(f"Provider: {args.provider.upper()} | Execution Date: {datetime.now().isoformat()}")
    print("=" * 80)

    summary: EvaluationRunSummary = run_evaluation_suite(provider=args.provider)

    print(f"\nBenchmark Summary:")
    print(f"  Total Test Cases:               {summary.total_tests}")
    print(f"  Passed Test Cases:              {summary.passed_tests}")
    print(f"  Failed Test Cases:              {summary.failed_tests}")
    print(f"  Overall Accuracy:               {summary.accuracy_percentage}%")
    print(f"  Refusal Correctness:            {summary.refusal_correctness_percentage}%")
    print(f"  Citation Validity:              {summary.citation_validity_percentage}%")
    print(f"  Average Execution Latency:      {summary.average_latency_ms} ms")
    print("\n" + "-" * 80)
    print(f"{'Test ID':<9} | {'Category':<32} | {'Verdict':<7} | {'Latency':<8} | {'Status'}")
    print("-" * 80)

    for r in summary.results:
        verdict = "PASS" if r.passed else "FAIL"
        print(f"{r.test_id:<9} | {r.category:<32} | {verdict:<7} | {r.latency_ms:>5.1f} ms | {r.actual_status}")

    print("-" * 80)

    # Prepare JSON output
    out_path = repo_root / args.output
    out_path.parent.mkdir(parents=True, exist_ok=True)

    report_payload = {
        "timestamp": datetime.now().isoformat(),
        "provider": args.provider,
        "summary": {
            "total_tests": summary.total_tests,
            "passed_tests": summary.passed_tests,
            "failed_tests": summary.failed_tests,
            "accuracy_percentage": summary.accuracy_percentage,
            "refusal_correctness_percentage": summary.refusal_correctness_percentage,
            "citation_validity_percentage": summary.citation_validity_percentage,
            "average_latency_ms": summary.average_latency_ms
        },
        "results": [r.model_dump() for r in summary.results]
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report_payload, f, indent=2)

    print(f"\n[✓] Honest execution report successfully saved to:\n    {out_path}\n")
    print("=" * 80)

    # Return exit code based on benchmark result
    if summary.failed_tests > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
