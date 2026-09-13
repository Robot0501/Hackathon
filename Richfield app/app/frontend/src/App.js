import React, { useEffect } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { AuthProvider, useAuth } from "./lib/auth";
import { API } from "./lib/api";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Network from "./pages/Network";
import Feed from "./pages/Feed";
import { JobsList, JobDetail, EmployerJobs, JobApplicants } from "./pages/Jobs";
import Applications from "./pages/Applications";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import AIAssistant from "./pages/AIAssistant";
import CareerExplorer from "./pages/CareerExplorer";
import Admin from "./pages/Admin";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function WSConnector() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("rf_token"); if (!token) return;
    const wsUrl = API.replace(/^http/, "ws") + "/ws/" + token;
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (e) => { try { const p = JSON.parse(e.data); if (p.kind === "notification") toast(p.notification.message); } catch {} };
    } catch {}
    return () => { try { ws?.close(); } catch {} };
  }, [user]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <WSConnector />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/profile/:userId" element={<Protected><Profile /></Protected>} />
          <Route path="/network" element={<Protected><Network /></Protected>} />
          <Route path="/feed" element={<Protected><Feed /></Protected>} />
          <Route path="/jobs" element={<Protected><JobsList /></Protected>} />
          <Route path="/jobs/:id" element={<Protected><JobDetail /></Protected>} />
          <Route path="/jobs/:id/applicants" element={<Protected><JobApplicants /></Protected>} />
          <Route path="/employer/jobs" element={<Protected><EmployerJobs /></Protected>} />
          <Route path="/employer/jobs/new" element={<Protected><EmployerJobs /></Protected>} />
          <Route path="/applications" element={<Protected><Applications /></Protected>} />
          <Route path="/messages" element={<Protected><Messages /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
          <Route path="/ai" element={<Protected><AIAssistant /></Protected>} />
          <Route path="/careers" element={<Protected><CareerExplorer /></Protected>} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
