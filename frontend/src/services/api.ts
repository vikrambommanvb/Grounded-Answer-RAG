import {
  QueryRequest,
  QueryResponse,
  PolicySummary,
  ClauseDetail,
  TimelineResponse,
  SourceDocument,
  SourceDocumentDetail,
  EvaluationSummary,
  SystemConfig,
  HealthResponse,
} from '../types';

/**
 * Resolves the backend API base endpoint URL:
 * - Production on Vercel: reads VITE_API_BASE_URL (e.g. 'https://grounded-answer-rag.onrender.com')
 *   and ensures '/api' is appended without duplication.
 * - Local development / missing env: safely falls back to '/api' to use Vite's dev proxy (http://127.0.0.1:8000).
 */
const getApiBase = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE = getApiBase();

export const fetchHealth = async (): Promise<HealthResponse> => {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  const data = await res.json();
  return {
    ...data,
    status: data.status === 'ok' ? 'healthy' : data.status,
  };
};

export const askQuestion = async (req: QueryRequest): Promise<QueryResponse> => {
  const res = await fetch(`${API_BASE}/chat/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Query failed: ${res.statusText}`);
  }
  return res.json();
};

export const fetchPolicySummary = async (): Promise<PolicySummary> => {
  const res = await fetch(`${API_BASE}/policies/summary`).catch(() => fetch(`${API_BASE}/policies`));
  if (!res.ok) {
    const fallbackRes = await fetch(`${API_BASE}/policies`);
    if (!fallbackRes.ok) throw new Error(`Failed to fetch policy summary: ${res.statusText}`);
    return fallbackRes.json();
  }
  return res.json();
};

export const fetchClauses = async (
  partNumber?: number,
  amendedOnly?: boolean
): Promise<{ total: number; clauses: ClauseDetail[] }> => {
  const params = new URLSearchParams();
  if (partNumber !== undefined && partNumber !== null) {
    params.set('part', partNumber.toString());
    params.set('part_number', partNumber.toString());
  }
  if (amendedOnly !== undefined) {
    params.set('amended_only', amendedOnly.toString());
  }
  const url = `${API_BASE}/policies/clauses?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch clauses: ${res.statusText}`);
  const data = await res.json();

  if (Array.isArray(data)) {
    return {
      total: data.length,
      clauses: data.map((item: any) => ({
        clause_id: item.clause_id,
        part_number: item.part_number,
        section_number: item.section_number,
        section_title: item.section_title,
        title: item.title || item.clause_id,
        verbatim_text: item.full_text || item.verbatim_text || '',
        is_amended: Boolean(item.is_amended || item.amendment_action),
        amended_text: item.amended_text || item.amendment_action?.new_text || null,
        amendment_action: item.amendment_action?.action_type || null,
        effective_date: item.effective_date,
        transitional_rule: item.transitional_rule || item.amendment_action?.transitional_rule_ref || null,
        cross_references: item.cross_references || [],
      })),
    };
  }
  return data;
};

export const fetchClauseDetail = async (clauseId: string): Promise<ClauseDetail> => {
  const encoded = encodeURIComponent(clauseId);
  const res = await fetch(`${API_BASE}/policies/clauses/${encoded}`);
  if (!res.ok) throw new Error(`Failed to fetch clause ${clauseId}: ${res.statusText}`);
  const data = await res.json();

  if (data.clause) {
    const c = data.clause;
    return {
      clause_id: c.clause_id,
      part_number: c.part_number,
      section_number: c.section_number,
      section_title: c.section_title,
      title: c.title || c.clause_id,
      verbatim_text: c.full_text || c.verbatim_text || '',
      is_amended: data.is_amended,
      amended_text: data.amendment_action?.new_text || null,
      amendment_action: data.amendment_action?.action_type || null,
      effective_date: data.amendment_action?.effective_date || c.effective_date,
      transitional_rule: data.amendment_action?.transitional_rule_ref || null,
      cross_references: c.cross_references || [],
    };
  }
  return data;
};

export const fetchTimeline = async (): Promise<TimelineResponse> => {
  const res = await fetch(`${API_BASE}/policies/timeline`);
  if (!res.ok) throw new Error(`Failed to fetch timeline: ${res.statusText}`);
  const data = await res.json();

  if (Array.isArray(data)) {
    return {
      baseline_effective_date: '2025-12-31',
      amendment_enactment_date: '2026-02-12',
      amendment_effective_date: '2026-03-01',
      timeline_events: data.map((e: any) => ({
        date: e.event_date || e.date,
        title: e.title,
        description: e.description,
        event_type: (e.event_type || 'baseline').toLowerCase().includes('enact')
          ? 'enactment'
          : (e.event_type || '').toLowerCase().includes('effect')
          ? 'effective_date'
          : 'baseline',
      })),
      transitional_provisions: [
        {
          rule_id: 'RULE-5.1',
          paragraph: 'Paragraph 5.1',
          title: 'Part 6 Rates & Determination Date Rule',
          applies_to: 'Part 6 Rates, $175 Disregard, Thresholds, 15% Sanction',
          rule_description: 'Applies strictly to claims determined on or after 1 March 2026.',
          statutory_basis: 'Amendment No. 2026-01 §5.1',
        },
        {
          rule_id: 'RULE-5.2',
          paragraph: 'Paragraph 5.2',
          title: 'Part 4 Reporting & Occurrence Date Rule',
          applies_to: 'Part 4 Change of Circumstances Reporting Windows',
          rule_description: '14-day rule applies strictly where change occurs on or after 1 March 2026; earlier changes retain 10-day rule.',
          statutory_basis: 'Amendment No. 2026-01 §5.2',
        },
        {
          rule_id: 'RULE-5.3',
          paragraph: 'Paragraph 5.3 & §7.4.3',
          title: 'Spanning Claim Daily Award Apportionment',
          applies_to: 'Claim periods spanning across 1 March 2026',
          rule_description: 'Pre-March days at 2025 rates; post-March days at amended rates via §7.4.3 daily formula.',
          statutory_basis: 'Amendment No. 2026-01 §5.3 & §7.4.3',
        },
      ],
    };
  }
  return data;
};

export const fetchDocuments = async (): Promise<SourceDocument[]> => {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error(`Failed to fetch documents: ${res.statusText}`);
  const list = await res.json();
  return list.map((d: any) => {
    const isAmd = d.document_id.includes('AMD') || d.title?.toLowerCase().includes('amendment');
    return {
      document_id: d.document_id,
      title: d.title,
      filename: d.filename || (isAmd ? 'Amendment No. 2026-01.md' : 'policy-manual.md'),
      document_type: d.document_type || (isAmd ? 'amendment' : 'manual'),
      effective_date: d.effective_date,
      byte_size: d.byte_size || (isAmd ? 8420 : 92450),
      sha256_hash: d.sha256_hash || d.content_hash,
      clause_count: d.clause_count,
    };
  });
};

export const fetchDocumentDetail = async (docId: string): Promise<SourceDocumentDetail> => {
  const encoded = encodeURIComponent(docId);
  const res = await fetch(`${API_BASE}/documents/${encoded}`);
  if (!res.ok) throw new Error(`Failed to fetch document ${docId}: ${res.statusText}`);
  const data = await res.json();
  const d = data.document || data;
  const isAmd = d.document_id?.includes('AMD') || d.title?.toLowerCase().includes('amendment');
  return {
    document_id: d.document_id,
    title: d.title,
    filename: d.filename || (isAmd ? 'Amendment No. 2026-01.md' : 'policy-manual.md'),
    document_type: d.document_type || (isAmd ? 'amendment' : 'manual'),
    effective_date: d.effective_date,
    byte_size: d.byte_size || (isAmd ? 8420 : 92450),
    sha256_hash: d.sha256_hash || d.content_hash,
    clause_count: d.clause_count,
    raw_content: data.raw_content || '',
  };
};

export const fetchEvaluationSummary = async (): Promise<EvaluationSummary> => {
  const res = await fetch(`${API_BASE}/evaluation/summary`);
  if (!res.ok) throw new Error(`Failed to fetch evaluation summary: ${res.statusText}`);
  return res.json();
};

export const runEvaluation = async (provider: string = 'mock'): Promise<EvaluationSummary> => {
  const params = new URLSearchParams({ provider });
  const res = await fetch(`${API_BASE}/evaluation/run?${params.toString()}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to run evaluation: ${res.statusText}`);
  return res.json();
};

export const fetchSystemConfig = async (): Promise<SystemConfig> => {
  const res = await fetch(`${API_BASE}/system/config`);
  if (!res.ok) throw new Error(`Failed to fetch system config: ${res.statusText}`);
  return res.json();
};
