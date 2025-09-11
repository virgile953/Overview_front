"use client";
import { SquareActivity, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

// export default function DevicesDashboard({ className }: { className?: string }) {

export function GroupsComponent({ className }: { className?: string }) {

  const [groupCount, setGroupCount] = useState<number | null>(null);
  useEffect(() => {
    async function fetchStatus() {
      const res = await fetch('/api/dashboard/groups');
      if (res.ok) {
        const data = await res.json();
        setGroupCount(data);
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className={twMerge("p-4 bg-sidebar-accent rounded-lg shadow-md", className)}>
      <div className="flex items-center mb-4">
        <SquareActivity className="text-emerald-400 mr-2" />
        <h2 className="text-lg font-semibold text-foreground">Groups</h2>
      </div>
      <div className="text-3xl font-bold text-foreground">{groupCount !== null ? groupCount : 0}</div>
      <div className="mt-2 text-sm text-muted-foreground">Total Groups</div>
      <Link href="/dashboard/groups" className="mt-4 inline-flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
        View Details <SquareArrowOutUpRight className="ml-1" size={14} />
      </Link>
    </div>
  );
}

