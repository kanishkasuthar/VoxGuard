import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiMenu,
  FiShield,
  FiSearch,
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiWifi,
  FiWifiOff
} from "react-icons/fi";
import { useToast } from "../../context/NotificationContext";
import { useVoxBot } from "../../context/VoxBotContext";
import { useNetworkStatus } from "../../services/networkStatus";

export const Topbar = ({ onOpenSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { sendMessage, setIsCollapsed } = useVoxBot();
  const isOnline = useNetworkStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: "n1",
      title: "Voice Clone Attack Intercepted",
      desc: "Incoming call from +91 XXXXX 3210 blocked (Risk 91)",
      time: "10:42 AM",
      type: "threat",
      link: "/incidents/VG-1042"
    },
    {
      id: "n2",
      title: "Same Voice / New Number Match",
      desc: "+91 XXXXX 4821 matched existing identity VG-001 (96%)",
      time: "09:54 AM",
      type: "match",
      link: "/voice-identities/VG-001"
    },
    {
      id: "n3",
      title: "Trusted Contact Verified",
      desc: "Mom (+91 98765 43210) voice identity active",
      time: "08:30 AM",
      type: "info",
      link: "/trusted-contacts"
    }
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return { title: "VoxGuard.AI Platform", subtitle: "Real-time voice cloning impersonation defense system." };
      case "/dashboard":
        return { title: "Security Dashboard", subtitle: "Operational metrics across connected SIP trunks." };
      case "/trusted-contacts":
        return { title: "Trusted Contacts", subtitle: "Verified persona catalog and voice identity enrollment." };
      case "/incoming-call":
        return { title: "Incoming Call Defense", subtitle: "Real-time voice protection for a safer tomorrow." };
      case "/live-call":
        return { title: "Live Call Dashboard", subtitle: "Streaming spectral audio inspection & RTP analysis." };
      case "/risk-alert":
        return { title: "Risk Alert & Verification", subtitle: "High-threat voice clone impersonation state." };
      case "/call-report":
        return { title: "Call Audit Report", subtitle: "Forensic post-call security evidence." };
      case "/analyze-voice":
        return { title: "Analyze Voice", subtitle: "Forensic acoustic spectral inspection lab." };
      case "/voice-identities":
        return { title: "Voice Identities", subtitle: "Cross-number acoustic biometric repository." };
      case "/incidents":
        return { title: "Security Incidents", subtitle: "Intercepted voice impersonation attack logs." };
      case "/blockchain":
        return { title: "Protection History", subtitle: "Tamper-evident evidence hash ledger." };
      case "/profile":
        return { title: "User Profile", subtitle: "Account credentials and security tokens." };
      case "/settings":
        return { title: "Settings", subtitle: "Policy thresholds & SIP gateway settings." };
      default:
        return { title: "VoxGuard.AI", subtitle: "Voice Security Platform" };
    }
  };

  const { title, subtitle } = getPageTitle();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    addToast(`Searching VoxGuard telemetry for "${searchQuery}"...`, "info");
    navigate(`/incidents?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleOpenHelp = () => {
    setIsCollapsed(false);
    sendMessage("How does VoxGuard protect incoming phone calls?", { route: location.pathname });
    addToast("Opened VoxBot copilot for help.", "info");
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#0B2638] border-b border-[#D8E3E8] dark:border-[#234255] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs font-sans transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onOpenSidebar}
          className="xl:hidden p-2 text-[#0B3047] dark:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] rounded-xl transition-colors"
          title="Open Navigation"
        >
          <FiMenu className="text-lg" />
        </button>

        <div>
          <h1 className="text-base font-extrabold text-[#0B3047] dark:text-[#F5F7F8] leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-[11px] text-[#66737C] dark:text-[#AAB8C2] hidden sm:block truncate font-mono">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Network Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
            isOnline
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 animate-pulse"
          }`}
          title={isOnline ? "Online — Cloud & Local AI Active" : "Offline Mode — Local ONNX AI Engine Active"}
        >
          {isOnline ? <FiWifi className="text-emerald-600 dark:text-emerald-400 text-xs" /> : <FiWifiOff className="text-amber-600 dark:text-amber-400 text-xs" />}
          <span>{isOnline ? "ONLINE" : "OFFLINE (Local AI)"}</span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-44 lg:w-56">
          <FiSearch className="absolute left-3 top-2.5 text-[#66737C] dark:text-[#AAB8C2] text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search telemetry..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#D8E3E8] dark:border-[#234255] text-xs focus:outline-none focus:border-[#0B3047] dark:focus:border-[#6FA8C5] bg-[#FAF7F2] dark:bg-[#071A27] text-[#0B3047] dark:text-[#F5F7F8] placeholder-[#66737C] dark:placeholder-[#AAB8C2]"
          />
        </form>

        {/* Help / VoxBot Shortcut Icon */}
        <button
          onClick={handleOpenHelp}
          className="p-2 text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] rounded-xl transition-colors"
          title="Ask VoxBot Help"
        >
          <FiHelpCircle className="text-lg" />
        </button>

        {/* Notifications Bell Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] rounded-xl transition-colors relative"
            title="Security Notifications"
          >
            <FiBell className="text-lg" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E45B5B] ring-2 ring-white dark:ring-[#0B2638]" />
          </button>

          {/* Interactive Notifications Drawer Modal */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0B2638] rounded-2xl border border-[#D8E3E8] dark:border-[#234255] shadow-xl p-4 space-y-3 z-50 animate-fade-in font-sans">
              <div className="flex items-center justify-between border-b border-[#D8E3E8] dark:border-[#234255] pb-2">
                <span className="font-mono text-xs font-bold text-[#0B3047] dark:text-[#F5F7F8] uppercase">
                  SECURITY NOTIFICATIONS
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-[#F5F7F8]"
                >
                  <FiX className="text-sm" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link}
                    onClick={() => setShowNotifications(false)}
                    className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#071A27] hover:bg-[#EEF7FA] dark:hover:bg-[#102F42] border border-[#D8E3E8] dark:border-[#234255] block transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B3047] dark:text-[#F5F7F8] text-xs flex items-center gap-1.5">
                        {n.type === "threat" ? (
                          <FiAlertTriangle className="text-[#E45B5B]" />
                        ) : (
                          <FiCheckCircle className="text-[#3FA66B]" />
                        )}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#66737C] dark:text-[#AAB8C2] font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#66737C] dark:text-[#AAB8C2] leading-snug">{n.desc}</p>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-[#D8E3E8] dark:border-[#234255] text-center">
                <Link
                  to="/incidents"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-mono font-bold text-[#123F59] dark:text-[#6FA8C5] hover:underline"
                >
                  View All Security Incidents
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile User Icon */}
        <Link
          to="/profile"
          className="p-2 text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] rounded-xl transition-colors"
          title="User Profile"
        >
          <FiUser className="text-lg" />
        </Link>

        {/* Settings Icon */}
        <Link
          to="/settings"
          className="p-2 text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-[#F5F7F8] hover:bg-[#FAF7F2] dark:hover:bg-[#102F42] rounded-xl transition-colors"
          title="Settings"
        >
          <FiSettings className="text-lg" />
        </Link>
      </div>
    </header>
  );
};
