import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Footer } from "../common/Footer";
import { VoxBotProvider } from "../../context/VoxBotContext";
import { VoxBotSidePanel } from "../chatbot/VoxBotSidePanel";
import { GlobalIncomingCallAlert } from "../call/GlobalIncomingCallAlert";

export const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <VoxBotProvider>
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#071A27] text-[#0B3047] dark:text-[#F5F7F8] font-sans flex flex-col selection:bg-[#0B3047] selection:text-white relative transition-colors duration-200">
        {/* Global Real-Time Incoming Call Detection Alert */}
        <GlobalIncomingCallAlert />

        {/* Left Sidebar (w-64) */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Outer Layout Container for Topbar + Main + Persistent VoxBot Side Panel */}
        <div className="xl:pl-64 flex-1 flex flex-col min-w-0">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          
          {/* Main 3-Column Desktop Workspace (Main Content + Persistent VoxBot) */}
          <div className="flex-1 flex min-w-0">
            {/* Center Main Content Area */}
            <main className="flex-1 min-w-0 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Outlet />
            </main>

            {/* Persistent Right VoxBot AI Assistant Side Panel (280px - 340px) */}
            <VoxBotSidePanel />
          </div>

          <Footer />
        </div>
      </div>
    </VoxBotProvider>
  );
};
