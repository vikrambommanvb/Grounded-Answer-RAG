import { HealthResponse } from '../types';

export const fetchHealth = async (): Promise<HealthResponse> => {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
};

