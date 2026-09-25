import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useToast } from "../../context/NotificationContext";
import {
  FiShield,
  FiRadio,
  FiCpu,
  FiUsers,
  FiGrid,
  FiAlertOctagon,
  FiDatabase,
  FiUser,
  FiSettings,
  FiLogOut,
  FiPhoneCall,
  FiUserCheck,
  FiFileText,
  FiAlertTriangle
} from "react-icons/fi";

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const navGroups = [
    {
      groupLabel: null,
      items: [{ path: "/dashboard", label: "Dashboard", icon: FiGrid }]
    },
    {
      groupLabel: "PROTECTION",
      items: [
        { path: "/live-call", label: "Live Call Dashboard", icon: FiRadio },
        { path: "/incoming-call", label: "Incoming Call", icon: FiPhoneCall },
        { path: "/risk-alert", label: "Risk Alert", icon: FiAlertTriangle },
        { path: "/call-report", label: "Call Report", icon: FiFileText },
        { path: "/analyze-voice", label: "Analyze Voice", icon: FiCpu }
      ]
    },
    {
      groupLabel: "PEOPLE",
      items: [
        { path: "/trusted-contacts", label: "Trusted Contacts", icon: FiUserCheck },
        { path: "/voice-identities", label: "Voice Identities", icon: FiUsers }
      ]
    },
    {
      groupLabel: "SECURITY",
      items: [
        { path: "/incidents", label: "Incidents", icon: FiAlertOctagon },
        { path: "/blockchain", label: "Blockchain Audit", icon: FiDatabase }
      ]
    },
    {
      groupLabel: "ACCOUNT",
      items: [
        { path: "/profile", label: "Profile", icon: FiUser },
        { path: "/settings", label: "Settings", icon: FiSettings }
      ]
    }
  ];

  const handleLogout = () => {
    authService.logout();
    addToast("Logged out of VoxGuard session.", "info");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#0B3047]/30 backdrop-blur-xs xl:hidden"
        />
      )}

      {/* Left Light/Dark Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#0B2638] border-r border-[#D8E3E8] dark:border-[#234255] shadow-2xs flex flex-col justify-between transition-all duration-200 xl:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Navy Brand Logo Header */}
          <div className="h-16 px-6 border-b border-[#D8E3E8] dark:border-[#234255] flex items-center justify-between shrink-0">
            <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0B3047] dark:bg-[#102F42] text-white flex items-center justify-center font-bold text-sm shadow-2xs border border-transparent dark:border-[#234255]">
                <FiShield />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-[#0B3047] dark:text-[#F5F7F8]">
                  VoxGuard<span className="text-[#123F59] dark:text-[#6FA8C5] font-sans font-normal text-xs">.AI</span>
                </span>
                <span className="text-[9px] font-mono font-bold text-[#66737C] dark:text-[#AAB8C2] uppercase tracking-wider -mt-1">
                  Voice Security Shield
                </span>
              </div>
            </Link>
          </div>

          {/* Grouped Navigation Menu */}
          <nav className="p-4 space-y-4 font-sans">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {group.groupLabel && (
                  <span className="px-3 text-[10px] font-mono font-bold text-[#66737C] dark:text-[#AAB8C2] uppercase tracking-widest block mb-1">
                    {group.groupLabel}
                  </span>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/" && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#EEF7FA] dark:bg-[#102F42] text-[#0B3047] dark:text-[#F5F7F8] font-bold border border-[#DCECF4] dark:border-[#234255]"
                          : "text-[#66737C] dark:text-[#AAB8C2] hover:text-[#0B3047] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#102F42]"
                      }`}
                    >
                      <Icon className={`text-base shrink-0 ${isActive ? "text-[#0B3047] dark:text-[#F5F7F8]" : "text-[#66737C] dark:text-[#AAB8C2]"}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#D8E3E8] dark:border-[#234255] space-y-2 bg-[#FAF7F2]/60 dark:bg-[#071A27]/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#E45B5B] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <FiLogOut className="text-sm" /> Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};
