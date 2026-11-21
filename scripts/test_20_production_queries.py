"""20-Query Live Production Verification Suite for The Grounded Answer on Vercel."""
import json
import time
import urllib.request
import urllib.error

PROD_URL = "https://the-grounded-answer.vercel.app/api/chat/ask"

QUERIES = [
    {
        "id": 1,
        "name": "Post-Amendment Earnings Disregard",
        "payload": {
            "question": "What is the monthly earnings disregard under §6.4.1(a) for a determination made on 15 March 2026?",
            "determination_date": "2026-03-15"
        },
        "expected_status": "ANSWERED",
        "expected_citation": "§6.4.1(a)"
    },
    {
        "id": 2,
        "name": "Pre-Amendment Earnings Disregard",
        "payload": {
            "question": "What was the earnings disregard for a determination made on 15 February 2026?",
            "determination_date": "2026-02-15"
        },
        "expected_status": "ANSWERED_WITH_WARNING",
        "expected_citation": "§6.4.1(a)"
    },
    {
        "id": 3,
        "name": "Transitional Split Rule",
        "payload": {
            "question": "A recipient had a change of circumstances on 10 February 2026 and their determination is conducted on 20 March 2026. What reporting deadline and disregard rate apply?",
            "determination_date": "2026-03-20",
            "change_of_circumstances_date": "2026-02-10"
        },
        "expected_status": "ANSWERED_WITH_WARNING",
        "expected_citation": "§4.3.2"
    },
    {
        "id": 4,
        "name": "Spanning Claim Daily Apportionment",
        "payload": {
            "question": "How is an award calculated for a claim spanning from 15 February 2026 to 15 March 2026?",
            "claim_start_date": "2026-02-15",
            "claim_end_date": "2026-03-15"
        },
        "expected_status": "ANSWERED_WITH_WARNING",
        "expected_citation": "§7.4.3"
    },
    {
        "id": 5,
        "name": "Full-Time Student Apparent Gap Refusal",
        "payload": {
            "question": "How is the needs figure calculated for a full-time university student under §7.1.3 and §5.4?",
            "determination_date": "2026-03-15"
        },
        "expected_status": "REFUSED",
        "expected_refusal": "APPARENT_GAP"
    },
    {
        "id": 6,
        "name": "Pre-Amendment Reporting Internal Conflict Refusal",
        "payload": {
            "question": "For a pre-amendment change in January 2026, does §4.3.2 (10 days) or §9.1.4 (30 days) apply to prevent an overpayment?",
            "determination_date": "2026-01-20"
        },
        "expected_status": "REFUSED",
        "expected_refusal": "INTERNAL_CONFLICT"
    },
    {
        "id": 7,
        "name": "Out of Scope Business Grant Refusal",
        "payload": {
            "question": "Can I obtain a $50,000 commercial business expansion grant for my manufacturing company?"
        },
        "expected_status": "REFUSED",
        "expected_refusal": "OUT_OF_SCOPE"
    },
    {
        "id": 8,
        "name": "Missing Temporal Data Refusal",
        "payload": {
            "question": "What is the standard monthly earnings disregard under the Household Support Program?"
        },
        "expected_status": "REFUSED",
        "expected_refusal": "MISSING_TEMPORAL_DATA"
    },
    {
        "id": 9,
        "name": "Insufficient Household Evidence Refusal",
        "payload": {
            "question": "Am I eligible?"
        },
        "expected_status": "REFUSED",
        "expected_refusal": "INSUFFICIENT_EVIDENCE"
    },
    {
        "id": 10,
        "name": "Countable Resource Ceiling Limit",
        "payload": {
            "question": "What is the maximum amount of countable resources a household may hold to remain eligible?"
        },
        "expected_status": "ANSWERED",
        "expected_citation": "§2.4.1"
    },
    {
        "id": 11,
        "name": "Independent 16-17 Year Old Supervisory Gate",
        "payload": {
            "question": "Can an independent 16-year-old qualify for household support, and what approval is required?",
            "determination_date": "2026-03-15"
        },
        "expected_status": "ANSWERED_WITH_WARNING",
        "expected_citation": "§2.3.2"
    },
    {
        "id": 12,
        "name": "General Eligibility Age and Residence",
        "payload": {
            "question": "What are the core conditions of eligibility for an applicant under §2.1.2?"
        },
        "expected_status": "ANSWERED",
        "expected_citation": "§2.1.2"
    },
    {
        "id": 13,
        "name": "Exempt Resources Principal Home",
        "payload": {
            "question": "Is the principal home of an applicant counted towards the resources limit under §2.4.2?"
        },
        "expected_status": "ANSWERED",
        "expected_citation": "§2.4.2"
    },
    {
        "id": 14,
        "name": "Household Income Inclusions",
        "payload": {
            "question": "What income sources are taken into account when calculating countable household income?"
        },
        "expected_status": "ANSWERED"
    },
    {
        "id": 15,
        "name": "Supervisory Gate Under-18 Referral",
        "payload": {
            "question": "Under what circumstances must an application from a 17-year-old be referred to a supervisor?"
        },
        "expected_status": "ANSWERED_WITH_WARNING",
        "expected_citation": "§2.3.2"
    },
    {
        "id": 16,
        "name": "Amendment No. 2026-01 Scope",
        "payload": {
            "question": "What changes were introduced by Amendment No. 2026-01 effective 1 March 2026?"
        },
        "expected_status": "ANSWERED"
    },
    {
        "id": 17,
        "name": "Earnings Disregard Household Cap",
        "payload": {
            "question": "Does the earnings disregard apply per earner or per household under §6.4.2?"
        },
        "expected_status": "ANSWERED",
        "expected_citation": "§6.4.2"
    },
    {
        "id": 18,
        "name": "Consecutive Query Rate Check 1",
        "payload": {
            "question": "What earnings disregard applies for determination date 2026-03-25?",
            "determination_date": "2026-03-25"
        },
        "expected_status": "ANSWERED",
        "expected_citation": "§6.4.1(a)"
    },
    {
        "id": 19,
        "name": "Consecutive Query Rate Check 2",
        "payload": {
            "question": "What earnings disregard applies for determination date 2026-01-15?",
            "determination_date": "2026-01-15"
        },
        "expected_status": "ANSWERED_WITH_WARNING",
        "expected_citation": "§6.4.1(a)"
    },
    {
        "id": 20,
        "name": "Statutory Consistency Final Validation",
        "payload": {
            "question": "What is the resource ceiling under §2.4.1?"
        },
        "expected_status": "ANSWERED",
        "expected_citation": "§2.4.1"
    }
]

def run_tests():
    print(f"Starting 20 consecutive live queries to {PROD_URL}...\n" + "=" * 70)
    passed = 0
    latencies = []

    for item in QUERIES:
        q_id = item["id"]
        q_name = item["name"]
        data = json.dumps(item["payload"]).encode('utf-8')
        req = urllib.request.Request(
            PROD_URL,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "ProductionVerifier/1.0"
            },
            method="POST"
        )

        start = time.perf_counter()
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                elapsed_ms = (time.perf_counter() - start) * 1000
                latencies.append(elapsed_ms)
                status_code = resp.status
                body = json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            elapsed_ms = (time.perf_counter() - start) * 1000
            print(f"[{q_id:02d}/20] FAIL: {q_name} -> HTTP {e.code}")
            continue
        except Exception as e:
            print(f"[{q_id:02d}/20] FAIL: {q_name} -> Network Error: {e}")
            continue

        res_status = body.get("status")
        citations = [c.get("clause_id") for c in body.get("supporting_citations", [])]
        refusal_cat = body.get("refusal_details", {}).get("category") if body.get("refusal_details") else None

        # Verify expectations
        ok = True
        notes = []

        if "expected_status" in item and res_status != item["expected_status"]:
            ok = False
            notes.append(f"Status expected {item['expected_status']}, got {res_status}")

        if "expected_citation" in item:
            exp_cit = item["expected_citation"]
            if not any(exp_cit in c for c in citations):
                ok = False
                notes.append(f"Citation {exp_cit} not in {citations}")

        if "expected_refusal" in item:
            exp_ref = item["expected_refusal"]
            if refusal_cat != exp_ref:
                ok = False
                notes.append(f"Refusal expected {exp_ref}, got {refusal_cat}")

        if ok:
            passed += 1
            print(f"[{q_id:02d}/20] PASS ({elapsed_ms:5.1f}ms): {q_name} -> {res_status} | citations={citations or ['None']} | refusal={refusal_cat or 'None'}")
        else:
            print(f"[{q_id:02d}/20] FAIL ({elapsed_ms:5.1f}ms): {q_name} -> {res_status} | {'; '.join(notes)}")

    avg_ms = sum(latencies) / len(latencies) if latencies else 0
    print("=" * 70)
    print(f"Summary: {passed}/20 queries passed successfully on production.")
    print(f"Average latency: {avg_ms:.1f}ms (Min: {min(latencies):.1f}ms, Max: {max(latencies):.1f}ms)")
    return passed == len(QUERIES)

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
