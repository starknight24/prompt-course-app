/**
 * Main layout shell: Header + Sidebar + main content area.
 * Wrap authenticated pages with this component.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import FeedbackModal from "../FeedbackModal";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}
