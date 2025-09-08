import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UserProfile from "./UserProfile";

export default function Navbar() {
  const path = usePathname();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    emailVerification: boolean;
  } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/user", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="h-16 bg-emerald-950 border border-border rounded-lg shadow-sm flex items-center justify-between px-6">
      <h1 className="text-gray-300 text-lg font-semibold">
        {path.slice(1).split("/").map((segment, index) => (
          <span key={index} className="text-gray-300">
            {segment}
            {index < path.split("/").length - 2 && " - "}
          </span>
        ))}
      </h1>
      <div className="flex items-center space-x-4">
        {/* user menu, notifications, etc. */}
        <UserProfile name={user?.name || ""} email={user?.email || ""} emailVerification={user?.emailVerification || false} />
      </div>
    </div>
  );
}