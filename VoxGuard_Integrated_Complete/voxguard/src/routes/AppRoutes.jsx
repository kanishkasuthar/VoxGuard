import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { HomePage } from "../pages/public/HomePage";
import { AboutPage } from "../pages/public/AboutPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { OnboardingPage } from "../pages/onboarding/OnboardingPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { TrustedContactsPage } from "../pages/contacts/TrustedContactsPage";
import { IncomingCallPage } from "../pages/call/IncomingCallPage";
import { LiveCallPage } from "../pages/call/LiveCallPage";
import { LiveMonitorPage } from "../pages/monitor/LiveMonitorPage";
import { RiskAlertPage } from "../pages/call/RiskAlertPage";
import { CallReportPage } from "../pages/call/CallReportPage";
import { VoiceAnalysisPage } from "../pages/analyze/VoiceAnalysisPage";
import { VoiceVerificationPage } from "../pages/verify/VoiceVerificationPage";
import { VoiceIdentitiesListPage } from "../pages/identities/VoiceIdentitiesListPage";
import { VoiceIdentityDetailPage } from "../pages/identities/VoiceIdentityDetailPage";
import { IncidentsListPage } from "../pages/incidents/IncidentsListPage";
import { BlockchainAuditPage } from "../pages/blockchain/BlockchainAuditPage";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { SettingsPage } from "../pages/settings/SettingsPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected App Routes */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trusted-contacts" element={<TrustedContactsPage />} />
        <Route path="/incoming-call" element={<IncomingCallPage />} />
        <Route path="/live-call" element={<IncomingCallPage />} />
        <Route path="/live-monitor" element={<LiveMonitorPage />} />
        <Route path="/monitor" element={<LiveMonitorPage />} />
        <Route path="/risk-alert" element={<RiskAlertPage />} />
        <Route path="/call-report" element={<CallReportPage />} />
        <Route path="/analyze-voice" element={<VoiceAnalysisPage />} />
        <Route path="/analyze" element={<VoiceAnalysisPage />} />
        <Route path="/voice-verification" element={<VoiceVerificationPage />} />
        <Route path="/verify" element={<VoiceVerificationPage />} />
        <Route path="/voice-identities" element={<VoiceIdentitiesListPage />} />
        <Route path="/voice-identities/:id" element={<VoiceIdentityDetailPage />} />
        <Route path="/incidents" element={<IncidentsListPage />} />
        <Route path="/incidents/:id" element={<IncidentsListPage />} />
        <Route path="/blockchain" element={<BlockchainAuditPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* VoxBot is a persistent side assistant, redirect /voxbot to /dashboard */}
        <Route path="/voxbot" element={<Navigate to="/dashboard" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

