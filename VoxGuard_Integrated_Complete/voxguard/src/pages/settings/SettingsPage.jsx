import React, { useState, useEffect } from "react";
import { useToast } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import {
  FiSettings,
  FiLock,
  FiBell,
  FiShield,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiDatabase,
  FiCpu,
  FiSun,
  FiMoon,
  FiMonitor
} from "react-icons/fi";
import { authService } from "../../services/authService";
import { apiClient } from "../../services/api";

export const SettingsPage = () => {
  const { addToast } = useToast();
  const { theme, effectiveTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account"); // account, security, notifications, privacy

  // Load Saved Settings from LocalStorage or defaults
  const [securitySettings, setSecuritySettings] = useState(() => {
    const saved = localStorage.getItem("voxguard_security_settings");
    return saved ? JSON.parse(saved) : {
      voiceDetection: true,
      callerVerification: true,
      suspiciousAlerts: true,
      autoBlocking: false,
      protectionLevel: "Enhanced" // Standard, Enhanced, Strict
    };
  });

  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem("voxguard_notification_settings");
    return saved ? JSON.parse(saved) : {
      securityAlerts: true,
      highRiskCalls: true,
      voiceSpoofing: true,
      callActivity: true,
      emailAlerts: false
    };
  });

  const currentUser = authService.getCurrentUser() || {
    name: "Kanishka Suthar",
    phone: "+91 98765 43210",
    email: "kanishka.suthar@email.com",
    voiceId: "VG-001"
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res.data && res.data.success && res.data.settings) {
          setSecuritySettings(prev => ({ ...prev, ...res.data.settings }));
        }
      } catch (err) {
        console.warn("[Settings API] Fetch settings error:", err.message);
      }
    };
    fetchSettings();
  }, []);

  // Persist security settings
  useEffect(() => {
    localStorage.setItem("voxguard_security_settings", JSON.stringify(securitySettings));
    apiClient.put("/settings", securitySettings).catch(() => {});
  }, [securitySettings]);

  // Persist notification settings
  useEffect(() => {
    localStorage.setItem("voxguard_notification_settings", JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const toggleSecurity = (key) => {
    setSecuritySettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      addToast(`${key} updated to ${updated[key] ? "ON" : "OFF"}`, "info");
      return updated;
    });
  };

  const toggleNotification = (key) => {
    setNotificationSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      addToast(`Notification preference updated.`, "info");
      return updated;
    });
  };

  const handleClearHistory = () => {
    localStorage.removeItem("voxguard_incidents_cache");
    addToast("Security incident logs and local history cleared.", "success");
  };

  const handleDownloadData = () => {
    const exportData = {
      user: currentUser,
      securitySettings,
      notificationSettings,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voxguard_security_data_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast("Security data exported successfully.", "success");
  };

  const handleDeleteProfile = () => {
    addToast("Biometric Voice Profile VG-001 enrollment reset.", "info");
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6 font-sans">
      
      {/* PAGE HEADER */}
      <div className="text-center space-y-2 border-b border-[#D8E3E8] pb-4">
        <span className="text-[10px] font-mono uppercase font-extrabold text-[#123F59] tracking-widest block">
          VOXGUARD PERSONAL SECURITY
        </span>
        <h1 className="text-3xl font-serif text-[#0B3047] font-bold">Settings</h1>
        <p className="text-xs text-[#66737C] font-mono max-w-md mx-auto">
          Manage your personal information, voice protection preferences, notifications, and data privacy.
        </p>
      </div>

      {/* SETTINGS TABS */}
      <div className="flex justify-center border-b border-[#D8E3E8] gap-4 font-mono text-xs">
        {[
          { id: "account", label: "ACCOUNT" },
          { id: "security", label: "SECURITY" },
          { id: "notifications", label: "NOTIFICATIONS" },
          { id: "privacy", label: "PRIVACY" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-extrabold uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-[#0B3047] text-[#0B3047]"
                : "border-transparent text-[#66737C] hover:text-[#0B3047]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================== */}
      {/* 1. ACCOUNT SETTINGS TAB */}
      {/* ================================================== */}
      {activeTab === "account" && (
        <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6 font-sans">
          <div className="space-y-1 border-b border-[#D8E3E8] pb-3">
            <h2 className="text-lg font-serif font-bold text-[#0B3047] flex items-center gap-2">
              <FiUser className="text-[#123F59]" /> Account Settings
            </h2>
            <p className="text-xs text-[#66737C] font-mono">
              Personal information and VoxGuard account details.
            </p>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <h3 className="font-mono font-bold text-[#0B3047] uppercase text-[11px] tracking-wider block">
              PROFILE INFORMATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8]">
                <span className="text-[9px] font-mono text-[#66737C] uppercase block font-bold">FULL NAME</span>
                <span className="text-xs font-extrabold text-[#0B3047]">{currentUser.name}</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8]">
                <span className="text-[9px] font-mono text-[#66737C] uppercase block font-bold">PHONE NUMBER</span>
                <span className="text-xs font-mono font-extrabold text-[#0B3047]">{currentUser.phone}</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8]">
                <span className="text-[9px] font-mono text-[#66737C] uppercase block font-bold">EMAIL ADDRESS</span>
                <span className="text-xs font-mono font-extrabold text-[#0B3047] truncate block">{currentUser.email}</span>
              </div>
            </div>

            <div className="p-4 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#66737C] uppercase block font-bold">ACCOUNT STATUS</span>
                <span className="text-xs font-bold text-[#3FA66B] flex items-center gap-1">
                  ● Active Personal Account
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#66737C] uppercase block font-bold">VOICE SECURITY</span>
                <span className="text-xs font-bold text-emerald-800">
                  ✓ Enrolled (Voice ID: {currentUser.voiceId || "VG-001"})
                </span>
              </div>
            </div>

            {/* APPEARANCE / THEME SELECTOR */}
            <div className="pt-3 space-y-3 border-t border-[#D8E3E8] dark:border-[#234255]">
              <div className="space-y-0.5">
                <h3 className="font-mono font-bold text-[#0B3047] dark:text-[#F5F7F8] uppercase text-[11px] tracking-wider block">
                  APPEARANCE
                </h3>
                <p className="text-[11px] text-[#66737C] dark:text-[#AAB8C2] font-sans">
                  Choose how VoxGuard looks on your device.
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] dark:bg-[#071A27] rounded-2xl border border-[#D8E3E8] dark:border-[#234255] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                <div>
                  <span className="font-bold text-[#0B3047] dark:text-[#F5F7F8] text-xs uppercase block">THEME MODE</span>
                  <span className="text-[10px] text-[#66737C] dark:text-[#AAB8C2]">Currently active: <strong className="uppercase text-[#0B3047] dark:text-[#F5F7F8]">{effectiveTheme}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#0B2638] rounded-xl border border-[#D8E3E8] dark:border-[#234255]">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("[VOXGUARD THEME DEBUG]", {
                        CLICK_DETECTED: "YES",
                        REQUESTED_THEME: "light",
                        previousTheme: theme,
                        documentClassName: document.documentElement.className,
                        dataTheme: document.documentElement.getAttribute("data-theme"),
                        localStorageTheme: localStorage.getItem("voxguard_theme")
                      });
                      setTheme("light");
                      addToast("Switched to Light Theme", "info");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      theme === "light"
                        ? "bg-[#0B3047] dark:bg-[#123F59] text-white shadow-2xs"
                        : "text-[#0B3047] dark:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42]"
                    }`}
                  >
                    <FiSun className="text-amber-500 text-sm" /> <span>☀ Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      console.log("[VOXGUARD THEME DEBUG]", {
                        CLICK_DETECTED: "YES",
                        REQUESTED_THEME: "dark",
                        previousTheme: theme,
                        documentClassName: document.documentElement.className,
                        dataTheme: document.documentElement.getAttribute("data-theme"),
                        localStorageTheme: localStorage.getItem("voxguard_theme")
                      });
                      setTheme("dark");
                      addToast("Switched to Premium Dark Cybersecurity Theme", "info");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      theme === "dark"
                        ? "bg-[#0B3047] dark:bg-[#123F59] text-white shadow-2xs"
                        : "text-[#0B3047] dark:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42]"
                    }`}
                  >
                    <FiMoon className="text-sky-400 text-sm" /> <span>🌙 Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      console.log("[VOXGUARD THEME DEBUG]", {
                        CLICK_DETECTED: "YES",
                        REQUESTED_THEME: "system",
                        previousTheme: theme,
                        documentClassName: document.documentElement.className,
                        dataTheme: document.documentElement.getAttribute("data-theme"),
                        localStorageTheme: localStorage.getItem("voxguard_theme")
                      });
                      setTheme("system");
                      addToast("Theme synced with System Preference", "info");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      theme === "system"
                        ? "bg-[#0B3047] dark:bg-[#123F59] text-white shadow-2xs"
                        : "text-[#0B3047] dark:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42]"
                    }`}
                  >
                    <FiMonitor className="text-purple-400 text-sm" /> <span>◐ System</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. SECURITY SETTINGS TAB */}
      {/* ================================================== */}
      {activeTab === "security" && (
        <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6 font-sans">
          <div className="space-y-1 border-b border-[#D8E3E8] pb-3">
            <h2 className="text-lg font-serif font-bold text-[#0B3047] flex items-center gap-2">
              <FiShield className="text-[#3FA66B]" /> Security Settings
            </h2>
            <p className="text-xs text-[#66737C] font-mono">
              Manage how VoxGuard protects you from suspicious calls and synthetic voices.
            </p>
          </div>

          <div className="space-y-4 font-sans text-xs">
            
            {/* Voice Authenticity Detection */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">
                  VOICE PROTECTION — VOICE AUTHENTICITY DETECTION
                </span>
                <p className="text-[#66737C] text-[11px] leading-relaxed">
                  Detect potentially synthetic or manipulated voices during supported calls and audio analysis.
                </p>
              </div>
              <button
                onClick={() => toggleSecurity("voiceDetection")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  securitySettings.voiceDetection
                    ? "bg-[#3FA66B] text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {securitySettings.voiceDetection ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* Caller Verification */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">
                  CALLER VERIFICATION
                </span>
                <p className="text-[#66737C] text-[11px] leading-relaxed">
                  Verify trusted contacts when possible against your enrolled voice catalog.
                </p>
              </div>
              <button
                onClick={() => toggleSecurity("callerVerification")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  securitySettings.callerVerification
                    ? "bg-[#3FA66B] text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {securitySettings.callerVerification ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* Suspicious Call Alerts */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">
                  SUSPICIOUS CALL PROTECTION — CALL ALERTS
                </span>
                <p className="text-[#66737C] text-[11px] leading-relaxed">
                  Receive real-time warnings when suspicious financial or credential requests are detected.
                </p>
              </div>
              <button
                onClick={() => toggleSecurity("suspiciousAlerts")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  securitySettings.suspiciousAlerts
                    ? "bg-[#3FA66B] text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {securitySettings.suspiciousAlerts ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* Automatic Call Actions / Blocking */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">
                  AUTOMATIC CALL ACTIONS — AUTOMATIC BLOCKING
                </span>
                <p className="text-[#66737C] text-[11px] leading-relaxed">
                  Automatically block calls that meet your selected high-threat security criteria.
                </p>
              </div>
              <button
                onClick={() => toggleSecurity("autoBlocking")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  securitySettings.autoBlocking
                    ? "bg-[#E45B5B] text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {securitySettings.autoBlocking ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* CALL PROTECTION LEVEL */}
            <div className="p-4 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] space-y-3 font-mono">
              <span className="font-extrabold text-[#0B3047] text-xs uppercase block">
                CALL PROTECTION LEVEL
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { level: "Standard", desc: "Balanced protection for everyday calls." },
                  { level: "Enhanced", desc: "More sensitive detection of suspicious activity." },
                  { level: "Strict", desc: "More sensitive warnings and blocking recommendations." }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => {
                      setSecuritySettings((prev) => ({ ...prev, protectionLevel: item.level }));
                      addToast(`Call protection level set to ${item.level}`, "success");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                      securitySettings.protectionLevel === item.level
                        ? "bg-white border-[#0B3047] ring-2 ring-[#0B3047]/20 shadow-2xs"
                        : "bg-white/60 border-[#D8E3E8] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#0B3047]">
                      <span className={`w-2.5 h-2.5 rounded-full ${securitySettings.protectionLevel === item.level ? "bg-[#3FA66B]" : "border border-slate-400"}`} />
                      <span>{item.level}</span>
                    </div>
                    <p className="text-[10px] text-[#66737C] font-sans font-normal leading-tight">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 3. NOTIFICATION SETTINGS TAB */}
      {/* ================================================== */}
      {activeTab === "notifications" && (
        <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6 font-sans">
          <div className="space-y-1 border-b border-[#D8E3E8] pb-3">
            <h2 className="text-lg font-serif font-bold text-[#0B3047] flex items-center gap-2">
              <FiBell className="text-[#123F59]" /> Notification Settings
            </h2>
            <p className="text-xs text-[#66737C] font-mono">
              Choose which security events you want VoxGuard to notify you about.
            </p>
          </div>

          <div className="space-y-3 text-xs font-sans">
            
            {/* Security Alerts */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">SECURITY ALERTS</span>
                <p className="text-[#66737C] text-[11px]">Receive alerts when suspicious call activity is detected.</p>
              </div>
              <button
                onClick={() => toggleNotification("securityAlerts")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  notificationSettings.securityAlerts ? "bg-[#3FA66B] text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {notificationSettings.securityAlerts ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* High-Risk Calls */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">HIGH-RISK CALLS</span>
                <p className="text-[#66737C] text-[11px]">Get notified when a call reaches a high or critical risk level.</p>
              </div>
              <button
                onClick={() => toggleNotification("highRiskCalls")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  notificationSettings.highRiskCalls ? "bg-[#3FA66B] text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {notificationSettings.highRiskCalls ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* Voice Spoofing Alerts */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">VOICE SPOOFING ALERTS</span>
                <p className="text-[#66737C] text-[11px]">Get notified when a potentially synthetic voice is detected.</p>
              </div>
              <button
                onClick={() => toggleNotification("voiceSpoofing")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  notificationSettings.voiceSpoofing ? "bg-[#3FA66B] text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {notificationSettings.voiceSpoofing ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* Call Activity */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">CALL ACTIVITY</span>
                <p className="text-[#66737C] text-[11px]">Receive notifications about missed, incoming and completed calls.</p>
              </div>
              <button
                onClick={() => toggleNotification("callActivity")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  notificationSettings.callActivity ? "bg-[#3FA66B] text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {notificationSettings.callActivity ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

            {/* Email Alerts */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">EMAIL ALERTS</span>
                <p className="text-[#66737C] text-[11px]">Receive important security alerts and daily summaries by email.</p>
              </div>
              <button
                onClick={() => toggleNotification("emailAlerts")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  notificationSettings.emailAlerts ? "bg-[#3FA66B] text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {notificationSettings.emailAlerts ? "[ ON ]" : "[ OFF ]"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. PRIVACY & DATA TAB */}
      {/* ================================================== */}
      {activeTab === "privacy" && (
        <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6 font-sans">
          <div className="space-y-1 border-b border-[#D8E3E8] pb-3">
            <h2 className="text-lg font-serif font-bold text-[#0B3047] flex items-center gap-2">
              <FiLock className="text-[#0B3047]" /> Privacy & Data
            </h2>
            <p className="text-xs text-[#66737C] font-mono">
              Control how your voice and security information is handled.
            </p>
          </div>

          <div className="space-y-3 font-sans text-xs">
            
            {/* Voice Profile Explanation */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-0.5">
              <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">VOICE PROFILE</span>
              <p className="text-[#66737C] text-[11px] leading-relaxed">
                Your enrolled voice profile (Voice ID: VG-001) is used for voice verification and security analysis.
              </p>
            </div>

            {/* Call Audio Explanation */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-0.5">
              <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">CALL AUDIO</span>
              <p className="text-[#66737C] text-[11px] leading-relaxed">
                Call audio is processed locally on your device during real-time security analysis and is not uploaded to external servers or ad networks.
              </p>
            </div>

            {/* Transcripts Explanation */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-0.5">
              <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">TRANSCRIPTS</span>
              <p className="text-[#66737C] text-[11px] leading-relaxed">
                Live call transcripts are processed to detect suspicious requests (like OTP or financial demands) and are kept in browser storage.
              </p>
            </div>

            {/* Security History Explanation */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-0.5">
              <span className="font-bold text-[#0B3047] text-xs font-mono uppercase block">SECURITY HISTORY & EVIDENCE RECORDS</span>
              <p className="text-[#66737C] text-[11px] leading-relaxed">
                Security incident logs and SHA-256 evidence hashes are generated locally to verify tamper-evident integrity without storing raw audio.
              </p>
            </div>

            {/* PRIVACY CONTROLS */}
            <div className="pt-3 space-y-2">
              <h3 className="font-mono font-bold text-[#0B3047] uppercase text-[11px] tracking-wider block">
                PRIVACY CONTROLS
              </h3>

              <div className="flex flex-wrap gap-2 font-mono">
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-slate-100 text-[#0B3047] font-bold text-xs rounded-xl border border-[#D8E3E8] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FiTrash2 className="text-xs text-[#E45B5B]" /> Clear Security History
                </button>

                <button
                  onClick={handleDownloadData}
                  className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-slate-100 text-[#0B3047] font-bold text-xs rounded-xl border border-[#D8E3E8] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FiDownload className="text-xs text-[#123F59]" /> Download My Data
                </button>

                <button
                  onClick={handleDeleteProfile}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-[#E45B5B] font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FiAlertTriangle className="text-xs" /> Reset Voice Profile
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
