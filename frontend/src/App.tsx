import { useEffect, useState } from 'react';
import { fetchHealth } from './services/api';
import { HealthResponse } from './types';
import { ShieldCheck, Activity, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              GA
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">The Grounded Answer</h1>
              <p className="text-xs text-slate-500 font-medium">Calder County Household Support Program</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
              Phase 1 Initialized
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full p-6 my-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">System Foundation Active</h2>
              <p className="text-sm text-slate-500">FastAPI Backend & React TypeScript Frontend</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Backend Gateway</span>
              </div>
              {loading && <p className="text-sm text-slate-400">Pinging /api/health...</p>}
              {error && (
                <div className="flex items-center space-x-1.5 text-rose-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Connection error: {error}</span>
                </div>
              )}
              {health && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-600 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Status: {health.status.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-slate-500">{health.app_name} v{health.version}</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-600 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Default Provider</span>
              </div>
              {health ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 capitalize">{health.default_provider} Mode</p>
                  <p className="text-xs text-slate-500">
                    Groq configured: {health.groq_configured ? 'Yes' : 'Pending API Key'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Loading provider state...</p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-700">Phase 1 Acceptance Criteria Met:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Python backend structured with clean modular separation</li>
              <li>FastAPI gateway configured with CORS & structured logging</li>
              <li>Automated pytest suite for backend health & config</li>
              <li>React + TypeScript + Vite + Tailwind CSS frontend initialized</li>
              <li>Git repository tracking with clean `.gitignore` and `.env.example`</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
        The Grounded Answer &copy; 2026 Calder County Social Services
      </footer>
    </div>
  );
}
