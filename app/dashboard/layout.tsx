"use client";

import { SidebarLayout, SidebarProvider } from "../ui/Sidebar/ShadcnSidebar";
import { useEffect, useMemo, useState } from "react";

// Create a user context for the dashboard
interface User {
  name: string;
  email: string;
  emailVerification: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
}

import { createContext, useContext } from "react";

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export const useUser = () => useContext(UserContext);

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/user", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      <SidebarProvider>
        <SidebarLayout user={user} loading={loading}>
          {children}
        </SidebarLayout>
      </SidebarProvider>
    </UserContext.Provider>
  );
}