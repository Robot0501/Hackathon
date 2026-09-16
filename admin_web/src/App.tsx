import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BusinessesPage } from './pages/BusinessesPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { UsersPage } from './pages/UsersPage';
import { ModerationPage } from './pages/ModerationPage';
import { EventsPage } from './pages/EventsPage';
import { BroadcastPage } from './pages/BroadcastPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/businesses" element={<BusinessesPage />} />
                    <Route path="/opportunities" element={<OpportunitiesPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/moderation" element={<ModerationPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/broadcast" element={<BroadcastPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
