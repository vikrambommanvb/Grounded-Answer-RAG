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

const API_BASE = '/api';

export const fetchHealth = async (): Promise<HealthResponse> => {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
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
  const res = await fetch(`${API_BASE}/policies/summary`);
  if (!res.ok) throw new Error(`Failed to fetch policy summary: ${res.statusText}`);
  return res.json();
};

export const fetchClauses = async (
  partNumber?: number,
  amendedOnly?: boolean
): Promise<{ total: number; clauses: ClauseDetail[] }> => {
  const params = new URLSearchParams();
  if (partNumber !== undefined && partNumber !== null) {
    params.set('part_number', partNumber.toString());
  }
  if (amendedOnly !== undefined) {
    params.set('amended_only', amendedOnly.toString());
  }
  const url = `${API_BASE}/policies/clauses?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch clauses: ${res.statusText}`);
  return res.json();
};

export const fetchClauseDetail = async (clauseId: string): Promise<ClauseDetail> => {
  const encoded = encodeURIComponent(clauseId);
  const res = await fetch(`${API_BASE}/policies/clauses/${encoded}`);
  if (!res.ok) throw new Error(`Failed to fetch clause ${clauseId}: ${res.statusText}`);
  return res.json();
};

export const fetchTimeline = async (): Promise<TimelineResponse> => {
  const res = await fetch(`${API_BASE}/policies/timeline`);
  if (!res.ok) throw new Error(`Failed to fetch timeline: ${res.statusText}`);
  return res.json();
};

export const fetchDocuments = async (): Promise<SourceDocument[]> => {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error(`Failed to fetch documents: ${res.statusText}`);
  return res.json();
};

export const fetchDocumentDetail = async (docId: string): Promise<SourceDocumentDetail> => {
  const res = await fetch(`${API_BASE}/documents/${docId}`);
  if (!res.ok) throw new Error(`Failed to fetch document ${docId}: ${res.statusText}`);
  return res.json();
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
