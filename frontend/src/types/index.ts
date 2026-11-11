export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  default_provider: string;
  groq_configured: boolean;
}

