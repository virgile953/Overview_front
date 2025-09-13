"use client";

import { SidebarLayout, SidebarProvider } from "../ui/Sidebar/ShadcnSidebar";
import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
  emailVerification: boolean;
}

interface UserContextType {
  user: User | null;
}

import { createContext, useContext } from "react";

const UserContext = createContext<UserContextType>({ user: null });

export const useUser = () => useContext(UserContext);

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const user = await fetch("/api/auth/user").then(res => res.json());
      if (!user || user.status === 401) {
        setUser(null);
        return;
      }
      setUser({ name: user.user.name, email: user.user.email, emailVerification: user.user.emailVerification });
    }
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      <SidebarProvider>
        <SidebarLayout user={user}>
          {children}
        </SidebarLayout>
      </SidebarProvider>
    </UserContext.Provider>
  );
}