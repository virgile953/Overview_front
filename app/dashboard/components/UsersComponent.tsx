"use client";
import { EllipsisVertical, SquareArrowOutUpRight, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export function UsersComponent({ className }: { className?: string }) {

  const [userCount, setUserCount] = useState<number | null>(null);
  useEffect(() => {
    async function fetchStatus() {
      const res = await fetch('/api/dashboard/users');
      if (res.ok) {
        const data = await res.json();
        setUserCount(data);
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className={twMerge("p-4 bg-sidebar-accent rounded-lg shadow-md", className)}>
      <div className="flex items-center mb-4">
        <Users className="text-emerald-400 mr-2" />
        <h2 className="text-lg font-semibold text-foreground">Users</h2>
        <EllipsisVertical className="ml-auto text-foreground" />
      </div>
      <div className="text-3xl font-bold text-foreground">{userCount !== null ? userCount : 0}</div>
      <div className="mt-2 text-sm text-muted-foreground">Total Users</div>
      <Link href="/dashboard/users" className="mt-4 inline-flex items-center text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
        View Details <SquareArrowOutUpRight className="ml-1" size={14} />
      </Link>
    </div>
  );
}

