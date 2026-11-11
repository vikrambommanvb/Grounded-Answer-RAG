import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AssistantPage } from './pages/AssistantPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { TimelinePage } from './pages/TimelinePage';
import { EvaluationDashboardPage } from './pages/EvaluationDashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

const NotFoundPage: React.FC = () => (
  <div className="p-12 text-center space-y-3">
    <h2 className="text-xl font-bold text-slate-900">404 - Page Not Found</h2>
    <p className="text-xs text-slate-500">The requested casework module does not exist.</p>
    <a
      href="/"
      className="inline-block mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
    >
      Return to Dashboard
    </a>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="evaluation" element={<EvaluationDashboardPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
