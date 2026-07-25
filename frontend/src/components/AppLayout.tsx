import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { SidebarNavigation } from './SidebarNavigation';
import { TopBar } from './TopBar';
import { FloatingMentorDrawer } from './FloatingMentorDrawer';

export const AppLayout: React.FC = () => {
  const { parsedData } = useResume();
  const [isMentorOpen, setIsMentorOpen] = useState(false);

  // If no resume uploaded yet, redirect to resume upload onboarding
  if (!parsedData) {
    return <Navigate to="/upload" replace />;
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-[#7C5CFF]/30 selection:text-white">
      {/* Premium Sidebar Navigation */}
      <SidebarNavigation
        isMentorOpen={isMentorOpen}
        onToggleMentor={() => setIsMentorOpen(!isMentorOpen)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#070B14]">
        {/* Sticky Top Bar Header */}
        <TopBar onToggleMentor={() => setIsMentorOpen(!isMentorOpen)} />

        {/* Main Content Workspace with 12-column spacing */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadein">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating AI Assistant Drawer */}
      <FloatingMentorDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
      />
    </div>
  );
};
