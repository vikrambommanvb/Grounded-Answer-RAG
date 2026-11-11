#!/usr/bin/env python3
"""
THE GROUNDED ANSWER — INTERACTIVE CASEWORK CLI
Official evidence-grounded decision support tool for Calder County HSP caseworkers.
"""
import sys
import os
import re
from pathlib import Path
from typing import Optional

# Ensure backend package is in python path
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root / "backend"))

from app.api.schemas.chat import QueryRequest, QueryResponse, ResponseStatus
from app.generation.generator import answer_generator
from app.database.models import get_clause_by_id, get_all_clauses, get_all_amendments
from app.evaluation.runner import run_evaluation_suite

# ANSI Color Codes
CYAN = "\033[96m"
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

DATE_REGEX = re.compile(r"^\d{4}-\d{2}-\d{2}$")

def print_banner():
    print(f"\n{BLUE}{BOLD}======================================================================{RESET}")
    print(f"{CYAN}{BOLD}              THE GROUNDED ANSWER — CASEWORK CLI{RESET}")
    print(f"{DIM}   Evidence-Grounded Policy Intelligence for Calder County HSP{RESET}")
    print(f"{DIM}      Consolidated Manual (148 Clauses) & Amendment No. 2026-01{RESET}")
    print(f"{BLUE}{BOLD}======================================================================{RESET}")
    print(f"{DIM}Commands: 'help', 'presets', 'clause <id>', 'eval', 'clear', 'exit'{RESET}\n")

def print_help():
    print(f"\n{BOLD}COMMAND REFERENCE:{RESET}")
    print(f"  {CYAN}ask{RESET}            : Start a new natural language policy inquiry")
    print(f"  {CYAN}presets{RESET}        : Select from standard casework test scenarios")
    print(f"  {CYAN}clause <id>{RESET}    : View verbatim text and amendment diff (e.g. 'clause §6.4.1(a)')")
    print(f"  {CYAN}eval{RESET}           : Run the 10-Question Benchmark Suite from terminal")
    print(f"  {CYAN}clear{RESET}          : Clear screen")
    print(f"  {CYAN}exit{RESET} / {CYAN}quit{RESET}   : Exit the assistant\n")

def prompt_date(prompt_text: str) -> Optional[str]:
    while True:
        val = input(f"  {prompt_text} (YYYY-MM-DD or Enter to skip): ").strip()
        if not val:
            return None
        if DATE_REGEX.match(val):
            return val
        print(f"  {RED}[!] Invalid date format. Please use YYYY-MM-DD (e.g. 2026-03-15).{RESET}")

def inspect_clause_cmd(clause_id: str):
    cid = clause_id.strip()
    if not cid.startswith("§"):
        cid = f"§{cid}"
    clause = get_clause_by_id(cid)
    if not clause:
        # Try stripping subsection parentheses like §6.4.1(a) -> §6.4.1
        base_cid = re.sub(r"\([a-z0-9]+\)$", "", cid)
        clause = get_clause_by_id(base_cid)
        
    if not clause:
        print(f"{RED}[!] Clause '{cid}' not found in Policy Manual.{RESET}")
        return

    # Check for matching amendment
    amendments = get_all_amendments()
    matching_amd = [
        a for a in amendments
        if a.target_clause_id and (
            a.target_clause_id.startswith(clause.clause_id) or
            clause.clause_id.startswith(a.target_clause_id) or
            a.target_clause_id == cid
        )
    ]
    amd = matching_amd[0] if matching_amd else None

    print(f"\n{BLUE}--- CLAUSE INSPECTOR: {clause.clause_id} ---{RESET}")
    print(f"{BOLD}Title:{RESET}       {clause.title or clause.section_title}")
    print(f"{BOLD}Location:{RESET}    Part {clause.part_number} ({clause.part_title}) &bull; Section {clause.section_number}: {clause.section_title}")
    print(f"{BOLD}Amended:{RESET}     {'YES (Amendment No. 2026-01)' if amd else 'NO (Baseline Consolidated Text)'}")
    
    if amd:
        print(f"{BOLD}Action:{RESET}      {amd.action_type.value if hasattr(amd.action_type, 'value') else amd.action_type} (Item {amd.item_number})")
        print(f"{BOLD}Effective:{RESET}   {amd.effective_date}")
        if amd.transitional_rule_ref:
            print(f"{BOLD}Transitional:{RESET} {amd.transitional_rule_ref}")
        print(f"\n{GREEN}{BOLD}CURRENT EFFECTIVE TEXT (Post-1 March 2026):{RESET}")
        print(f"{amd.new_text}")
        print(f"\n{DIM}PRE-AMENDMENT BASELINE TEXT (Historical 2025):{RESET}")
        print(f"{clause.full_text}")
    else:
        print(f"\n{BOLD}VERBATIM STATUTORY TEXT:{RESET}")
        print(f"{clause.full_text}")
    
    if clause.cross_references:
        print(f"\n{BOLD}Cross-References:{RESET} {', '.join(clause.cross_references)}")
    print(f"{BLUE}-------------------------------------------------{RESET}\n")

def display_response(resp: QueryResponse):
    print(f"\n{BLUE}{BOLD}----------------- EVIDENCE ENVELOPE -----------------{RESET}")
    
    # Status Banner
    if resp.status == ResponseStatus.REFUSED:
        cat = resp.refusal_details.category.value if resp.refusal_details else "REFUSED"
        print(f"{RED}{BOLD}STATUS: [REFUSED - {cat}]{RESET}")
    elif resp.status == ResponseStatus.ANSWERED_WITH_WARNING:
        print(f"{YELLOW}{BOLD}STATUS: [ANSWERED WITH SUPERVISORY NOTICE]{RESET}")
    else:
        print(f"{GREEN}{BOLD}STATUS: [GROUNDED ANSWER VERIFIED]{RESET}")
        
    exec_ms = getattr(resp, 'execution_time_ms', 0.0)
    provider_name = getattr(resp, 'provider', 'mock')
    print(f"{DIM}Latency: {exec_ms} ms | Provider: {provider_name.upper()}{RESET}\n")

    # Warnings (Supervisory Gates & Transitional)
    if resp.warnings:
        for w in resp.warnings:
            if "supervisor" in w.lower() or "§2.3.2" in w:
                print(f"{YELLOW}{BOLD}⚠️  SUPERVISORY REFERRAL GATE:{RESET} {w}")
            else:
                print(f"{CYAN}{BOLD}ℹ️  TEMPORAL ADVISORY:{RESET} {w}")
        print()

    # Refusal Card
    if resp.status == ResponseStatus.REFUSED and resp.refusal_details:
        ref = resp.refusal_details
        print(f"{RED}{BOLD}REFUSAL REASON:{RESET}")
        print(f"  {ref.reason}\n")
        
        if ref.missing_information:
            print(f"{YELLOW}{BOLD}MISSING FACTS REQUIRED TO ANSWER:{RESET}")
            for m in ref.missing_information:
                print(f"  • {m}")
            print()
            
        if ref.partial_relevant_clauses:
            print(f"{CYAN}{BOLD}PARTIAL RELEVANT CLAUSES:{RESET} {', '.join(ref.partial_relevant_clauses)}\n")
            
        if ref.recommended_next_step:
            print(f"{GREEN}{BOLD}RECOMMENDED CASEWORK ACTION:{RESET}")
            print(f"  {ref.recommended_next_step}\n")

    # Direct Answer & Explanation
    if resp.status in (ResponseStatus.ANSWERED, ResponseStatus.ANSWERED_WITH_WARNING):
        print(f"{GREEN}{BOLD}DIRECT STATUTORY ANSWER:{RESET}")
        print(f"  {resp.direct_answer}\n")
        
        if resp.policy_explanation:
            print(f"{BOLD}DETAILED POLICY EXPLANATION:{RESET}")
            print(f"  {resp.policy_explanation}\n")
            
        if resp.supporting_citations:
            print(f"{CYAN}{BOLD}SUPPORTING CITATIONS:{RESET}")
            for c in resp.supporting_citations:
                amd_tag = f" {GREEN}[Amended by No. 2026-01]{RESET}" if c.is_amended else ""
                title_str = getattr(c, 'clause_title', None) or getattr(c, 'title', '')
                print(f"  • {BOLD}{c.clause_id}{RESET}: {title_str}{amd_tag}")
            print()

    print(f"{BLUE}{BOLD}-----------------------------------------------------{RESET}")

def run_query(question: str, det_date: Optional[str] = None, chg_date: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None):
    req = QueryRequest(
        question=question,
        determination_date=det_date,
        change_of_circumstances_date=chg_date,
        claim_start_date=start_date,
        claim_end_date=end_date,
        provider="mock"
    )
    print(f"\n{DIM}[*] Evaluating policy against 148 ingested clauses...{RESET}")
    resp = answer_generator.generate_answer(req)
    display_response(resp)

def handle_presets():
    print(f"\n{BOLD}STANDARD CASEWORK SCENARIOS:{RESET}")
    print("  1. Countable Resources Maximum (§2.4.1)")
    print("  2. Independent 16-Year-Old Applicant (§2.3.1 & §2.3.2 Supervisory Gate)")
    print("  3. Pre-Amendment Earnings Disregard (Det: 2026-02-15)")
    print("  4. Post-Amendment Earnings Disregard (Det: 2026-03-15)")
    print("  5. Transitional Split Rule (Para 5.1 Disregard vs Para 5.2 Reporting)")
    print("  6. Spanning Claim Apportionment (Para 5.3 & §7.4.3)")
    print("  7. Full-Time Student Calculation Trap (§7.1.3 -> §5.4 Refusal)")
    print("  8. Pre-Amendment Inconsistency Trap (§4.3.2 vs §9.1.4 Refusal)")
    
    choice = input("\nSelect a scenario (1-8 or Enter to cancel): ").strip()
    if choice == "1":
        run_query("What is the maximum amount of countable resources a household may hold to qualify for assistance?")
    elif choice == "2":
        run_query("Can an independent 16-year-old with no parental support qualify for assistance?", det_date="2026-02-15")
    elif choice == "3":
        run_query("What is the monthly earnings disregard for a claim determined on 15 February 2026?", det_date="2026-02-15")
    elif choice == "4":
        run_query("What is the monthly earnings disregard for a claim determined on 15 March 2026?", det_date="2026-03-15")
    elif choice == "5":
        run_query(
            "A change of circumstances occurred on 10 February 2026, but determination is made on 20 March 2026. What reporting period applies to the change, and what earnings disregard applies?",
            det_date="2026-03-20",
            chg_date="2026-02-10"
        )
    elif choice == "6":
        run_query(
            "How is an award calculated for a claim period spanning from 15 February 2026 to 15 March 2026?",
            start_date="2026-02-15",
            end_date="2026-03-15"
        )
    elif choice == "7":
        run_query("How is the monthly needs figure calculated for a full-time university student under §7.1.3?")
    elif choice == "8":
        run_query(
            "Under the pre-amendment policy, what is the deadline to report a change of circumstances to prevent an overpayment from being established?",
            chg_date="2026-01-15"
        )

def main():
    print_banner()
    while True:
        try:
            line = input(f"{BOLD}caseworker@calder-hsp>{RESET} ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

        if not line:
            continue

        lower = line.lower()
        if lower in ("exit", "quit", "q"):
            print("Session terminated. Goodbye.")
            break
        elif lower in ("help", "?"):
            print_help()
        elif lower == "clear":
            os.system("clear")
            print_banner()
        elif lower == "presets":
            handle_presets()
        elif lower == "eval":
            print(f"\n{CYAN}[*] Running 10-Question Benchmark Suite...{RESET}")
            summary = run_evaluation_suite(provider="mock")
            print(f"\n{BOLD}BENCHMARK RESULTS:{RESET}")
            print(f"  Passed:   {GREEN if summary.passed_tests == summary.total_tests else RED}{summary.passed_tests}/{summary.total_tests}{RESET}")
            print(f"  Accuracy: {summary.accuracy_percentage}%")
            print(f"  Latency:  {summary.average_latency_ms} ms avg")
            for r in summary.results:
                badge = f"{GREEN}[PASS]{RESET}" if r.passed else f"{RED}[FAIL]{RESET}"
                print(f"  {badge} {r.test_id}: {r.category} ({r.latency_ms} ms)")
            print()
        elif lower.startswith("clause"):
            parts = line.split(maxsplit=1)
            if len(parts) > 1:
                inspect_clause_cmd(parts[1])
            else:
                print(f"{RED}[!] Please specify a clause ID (e.g. 'clause §2.4.1').{RESET}")
        else:
            # Natural language inquiry flow
            question = line
            print(f"\n{DIM}Enter optional dates or press Enter to skip:{RESET}")
            det_date = prompt_date("Determination Date")
            chg_date = prompt_date("Change Occurrence Date")
            start_date = prompt_date("Claim Start Date")
            end_date = prompt_date("Claim End Date")
            
            run_query(question, det_date, chg_date, start_date, end_date)

if __name__ == "__main__":
    main()
