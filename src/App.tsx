import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { OrgProvider } from './auth/OrgProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { CallbackPage } from './pages/CallbackPage';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { AnalysisNewPage } from './pages/AnalysisNewPage';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrganizationPage } from './pages/OrganizationPage';

import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OrgProvider>
          <BrowserRouter>
            <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/analysis/new" element={<AnalysisNewPage />} />
              <Route path="/history" element={<AnalysisHistoryPage />} />
              <Route path="/analysis/:id" element={<AnalysisResultPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/orgs/:orgId" element={<OrganizationPage />} />
            </Route>
          </Route>

          {/* Catch-all: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </OrgProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
