"use client";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="">
      <Sidebar />
      {/* Navbar positioned at top with margin-2, accounting for sidebar width */}
      <div className="fixed top-2 left-72 right-2 z-5">
        <Navbar />
      </div>
      {/* Main content area with margins for both sidebar and navbar */}
      <main className="ml-72 mr-2 mt-20 mb-2 p-6 rounded-lg shadow-sm">
        {children}
      </main>
    </div>
  );
}
