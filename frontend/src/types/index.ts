export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  default_provider: string;
  groq_configured: boolean;
}

export type ResponseStatus = 'ANSWERED' | 'ANSWERED_WITH_WARNING' | 'REFUSED';

export type RefusalCategory =
  | 'OUT_OF_SCOPE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'INTERNAL_CONFLICT'
  | 'APPARENT_GAP'
  | 'MISSING_TEMPORAL_DATA'
  | 'AMBIGUOUS_POLICY';

export interface QueryRequest {
  question: string;
  determination_date?: string | null;
  change_of_circumstances_date?: string | null;
  claim_start_date?: string | null;
  claim_end_date?: string | null;
  provider?: string | null;
}

export interface CitationBadge {
  clause_id: string;
  title: string;
  part_number: number;
  is_amended: boolean;
  amendment_provenance?: string | null;
  transitional_rule?: string | null;
  excerpt?: string | null;
}

export interface RetrievedEvidence {
  clause_id: string;
  part_number: number;
  title: string;
  score: number;
  bm25_score: number;
  vector_score: number;
  snippet: string;
  is_amended: boolean;
}

export interface TemporalResolution {
  is_amended_applied: boolean;
  rates_effective_date: string;
  reporting_effective_date: string;
  transitional_rule_notes: string[];
  is_spanning_claim: boolean;
}

export interface RefusalDetails {
  category: RefusalCategory;
  reason: string;
  missing_information: string[];
  partial_relevant_clauses: string[];
  recommended_next_step: string;
}

export interface QueryResponse {
  status: ResponseStatus;
  direct_answer: string | null;
  policy_explanation: string | null;
  supporting_citations: CitationBadge[];
  retrieved_evidence: RetrievedEvidence[];
  warnings: string[];
  temporal_resolution: TemporalResolution | null;
  refusal_details: RefusalDetails | null;
  provider?: string;
  execution_time_ms?: number;
  latency_ms?: number;
}

export interface PolicyPartSummary {
  part_number: number;
  title: string;
  section_count: number;
  clause_count: number;
}

export interface PolicySummary {
  title: string;
  total_parts: number;
  total_sections: number;
  total_clauses: number;
  baseline_date: string;
  amendment_number: string;
  amendment_effective_date: string;
  parts: PolicyPartSummary[];
}

export interface ClauseDetail {
  clause_id: string;
  part_number: number;
  section_number: string;
  section_title: string;
  title: string;
  verbatim_text: string;
  is_amended: boolean;
  amended_text?: string | null;
  amendment_action?: string | null;
  effective_date?: string | null;
  transitional_rule?: string | null;
  cross_references: string[];
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  event_type: 'baseline' | 'enactment' | 'effective_date';
}

export interface TransitionalRuleItem {
  rule_id: string;
  paragraph: string;
  title: string;
  applies_to: string;
  rule_description: string;
  statutory_basis: string;
}

export interface TimelineResponse {
  baseline_effective_date: string;
  amendment_enactment_date: string;
  amendment_effective_date: string;
  timeline_events: TimelineEvent[];
  transitional_provisions: TransitionalRuleItem[];
}

export interface SourceDocument {
  document_id: string;
  title: string;
  filename: string;
  document_type: string;
  effective_date: string;
  byte_size: number;
  sha256_hash: string;
  clause_count: number;
}

export interface SourceDocumentDetail extends SourceDocument {
  raw_content: string;
}

export interface TestCaseResult {
  test_id: string;
  category: string;
  question: string;
  passed: boolean;
  expected_status: string;
  actual_status: string;
  status_passed: boolean;
  citation_passed: boolean;
  phrases_passed: boolean;
  latency_ms: number;
  details: string;
}

export interface EvaluationSummary {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  accuracy_percentage: number;
  refusal_correctness_percentage: number;
  citation_validity_percentage: number;
  average_latency_ms: number;
  results: TestCaseResult[];
}

export interface SystemConfig {
  app_name: string;
  version: string;
  environment: string;
  active_provider: string;
  configured_providers: string[];
  groq_model: string;
  groq_key_configured: boolean;
  retrieval_top_k: number;
  similarity_threshold: number;
  hybrid_retrieval: boolean;
  security_notice: string;
}
