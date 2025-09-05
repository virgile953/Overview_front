import { account } from "@/app/Appwrite";
import { usePathname } from "next/navigation";
import router from "next/navigation";
import { useEffect } from "react";

export default function Navbar() {
  const path = usePathname();

  function handleLogout() {
    account.deleteSession("current").then(
      () => {
        // Session deleted, redirect to login
        router.redirect("/login");
      },
      (error) => {
        console.error("Error deleting session:", error);
      }
    );
  }

  useEffect(() => {
    account.get().then(
      () => {
        // User is authenticated, stay on the dashboard
        console.log("User is authenticated");
      },
      () => {
        // No session, redirect to login
        router.redirect("/login");
      }
    );
  });

  return (
    <div className="h-16 bg-emerald-950 border border-gray-200 rounded-lg shadow-sm flex items-center justify-between px-6">
      <h1 className="text-gray-300 text-lg font-semibold">
        {path.slice(1).split("/").map((segment, index) => (
          <span key={index} className="text-gray-300">
            {segment}
            {index < path.split("/").length - 2 && " - "}
          </span>
        ))}
      </h1>
      <div className="flex items-center space-x-4">
        {/* You can add user menu, notifications, etc. here */}
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <button onClick={handleLogout} className="text-white font-bold">L</button>
          {/* <span className="text-white text-sm font-medium">U</span> */}
        </div>
      </div>
    </div>
  );
}