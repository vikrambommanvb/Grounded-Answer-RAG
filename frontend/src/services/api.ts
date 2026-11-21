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
 * - On Vercel or localhost:
 *   Routes through the relative '/api' route handled by native serverless functions and edge rewrites.
 * - Handles missing environment variables safely.
 */
const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('vercel.app') || host === 'localhost' || host === '127.0.0.1') {
      const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
      // Allow override only if explicitly set to an alternative external server
      if (envUrl && !envUrl.includes('vercel.app') && !envUrl.includes('onrender.com') && envUrl !== '/api') {
        const cleanUrl = envUrl.replace(/\/+$/, '');
        return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
      }
      return '/api';
    }
  }

  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE = getApiBase();

/**
 * Parses HTTP responses and extracts real, actionable error messages with HTTP status codes.
 * Prevents blank "Query failed: " messages when HTTP/2 statusText is empty.
 */
export const formatHttpError = async (res: Response): Promise<string> => {
  const status = res.status;
  let detail = '';

  try {
    const data = await res.json();
    if (data && typeof data === 'object') {
      detail = data.detail || data.message || data.error || '';
    }
  } catch {
    try {
      const text = await res.text();
      if (text && text.length < 300 && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
        detail = text.trim();
      }
    } catch {
      // ignore parsing failure
    }
  }

  if (detail) {
    return `[HTTP ${status}] ${detail}`;
  }

  switch (status) {
    case 400:
      return `[HTTP 400] Bad Request: Invalid inquiry parameters submitted.`;
    case 404:
      return `[HTTP 404] Not Found: Requested policy endpoint could not be found.`;
    case 408:
      return `[HTTP 408] Request Timeout: The policy engine did not respond in time.`;
    case 422:
      return `[HTTP 422] Unprocessable Entity: Verification failed for input parameters.`;
    case 500:
      return `[HTTP 500] Internal Server Error: Policy evaluation encountered an unexpected issue.`;
    case 502:
      return `[HTTP 502] Bad Gateway: Unable to connect to upstream policy service.`;
    case 503:
      return `[HTTP 503] Service Unavailable: The policy engine is temporarily unavailable.`;
    case 504:
      return `[HTTP 504] Gateway Timeout: The policy engine timed out while processing.`;
    default:
      return `[HTTP ${status}] Request failed with status code ${status}.`;
  }
};

interface FetchWithRetryOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * Resilient fetch with client-side timeout (AbortController) and automatic 1-retry fallback.
 */
export const fetchWithTimeoutAndRetry = async (
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> => {
  const {
    timeoutMs = 15000,
    retries = 1,
    retryDelayMs = 800,
    ...fetchOpts
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...fetchOpts,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Retry once on transient upstream gateway failures (502, 503, 504)
      if (attempt < retries && [502, 503, 504].includes(res.status)) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        continue;
      }

      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      lastError = isAbort
        ? new Error(`Request timed out after ${timeoutMs / 1000}s while contacting policy engine.`)
        : new Error(err.message || 'Network connection failed.');

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed after retry.');
};

export const fetchHealth = async (): Promise<HealthResponse> => {
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/health`, { timeoutMs: 8000, retries: 1 });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Health check failed: ${errMsg}`);
  }
  const data = await res.json();
  return {
    ...data,
    status: data.status === 'ok' ? 'healthy' : data.status,
  };
};

export const askQuestion = async (req: QueryRequest): Promise<QueryResponse> => {
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/chat/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    timeoutMs: 25000,
    retries: 1,
  });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(errMsg);
  }
  return res.json();
};

export const fetchPolicySummary = async (): Promise<PolicySummary> => {
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/policies/summary`, { timeoutMs: 10000, retries: 1 })
    .catch(() => fetchWithTimeoutAndRetry(`${API_BASE}/policies`, { timeoutMs: 10000, retries: 1 }))
    .catch(() => fetchWithTimeoutAndRetry(`/data/clause_index.json`, { timeoutMs: 8000, retries: 0 }));

  if (!res.ok) {
    const fallbackRes = await fetchWithTimeoutAndRetry(`/data/clause_index.json`, { timeoutMs: 8000, retries: 0 });
    if (fallbackRes.ok) {
      const bundle = await fallbackRes.json();
      return {
        title: "Calder County Household Support Program Policy Manual",
        total_parts: bundle.metadata.total_parts,
        total_sections: bundle.metadata.total_sections,
        total_clauses: bundle.metadata.total_clauses,
        baseline_date: bundle.metadata.baseline_effective_date,
        amendment_number: bundle.metadata.amendment_number,
        amendment_effective_date: bundle.metadata.amendment_effective_date,
        parts: bundle.parts,
      };
    }
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to fetch policy summary: ${errMsg}`);
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
  
  let res: Response;
  try {
    res = await fetchWithTimeoutAndRetry(url, { timeoutMs: 10000, retries: 1 });
  } catch (err) {
    // Static fallback if API route is temporarily unreachable
    const staticRes = await fetchWithTimeoutAndRetry(`/data/clause_index.json`, { timeoutMs: 8000, retries: 0 });
    if (staticRes.ok) {
      const bundle = await staticRes.json();
      let filtered = bundle.clauses as any[];
      if (partNumber !== undefined && partNumber !== null) {
        filtered = filtered.filter((c) => c.part_number === partNumber);
      }
      return {
        total: filtered.length,
        clauses: filtered.map((item: any) => ({
          clause_id: item.clause_id,
          part_number: item.part_number,
          section_number: item.section_number,
          section_title: item.section_title,
          title: item.title || item.clause_id,
          verbatim_text: item.full_text || item.verbatim_text || '',
          is_amended: Boolean(item.is_amended),
          amended_text: item.amended_text || null,
          amendment_action: item.amendment_action || null,
          effective_date: item.effective_date,
          transitional_rule: item.transitional_rule || null,
          cross_references: item.cross_references || [],
        })),
      };
    }
    throw err;
  }

  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to fetch clauses: ${errMsg}`);
  }
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
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/policies/clauses/${encoded}`, { timeoutMs: 10000, retries: 1 });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to fetch clause ${clauseId}: ${errMsg}`);
  }
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
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/policies/timeline`, { timeoutMs: 10000, retries: 1 });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to fetch timeline: ${errMsg}`);
  }
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
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/documents`, { timeoutMs: 10000, retries: 1 });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to fetch documents: ${errMsg}`);
  }
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
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/documents/${encoded}`, { timeoutMs: 10000, retries: 1 });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to fetch document ${docId}: ${errMsg}`);
  }
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
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/evaluation/summary`, { timeoutMs: 10000, retries: 1 });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to fetch evaluation summary: ${errMsg}`);
  }
  return res.json();
};

export const runEvaluation = async (provider: string = 'mock'): Promise<EvaluationSummary> => {
  const params = new URLSearchParams({ provider });
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/evaluation/run?${params.toString()}`, {
    method: 'POST',
    timeoutMs: 30000,
    retries: 1,
  });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to run evaluation: ${errMsg}`);
  }
  return res.json();
};

export const fetchSystemConfig = async (): Promise<SystemConfig> => {
  const res = await fetchWithTimeoutAndRetry(`${API_BASE}/system/config`, { timeoutMs: 10000, retries: 1 });
  if (!res.ok) {
    const errMsg = await formatHttpError(res);
    throw new Error(`Failed to fetch system config: ${errMsg}`);
  }
  return res.json();
};
