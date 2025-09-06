"use client";
import { account } from "@/app/Appwrite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Settings, Moon, Sun, LogOut, ChevronRight } from "lucide-react";

interface UserProfileProps {
  name?: string;
  email?: string;
  emailVerification?: boolean;
}

export default function UserProfile(props: UserProfileProps) {
  const router = useRouter();
  const [accountInfo, setAccountInfo] = useState<UserProfileProps | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  async function handleLogout() {
    // Call a server action to delete the session
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function toggleTheme() {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  useEffect(() => {
    if (props.name || props.email) {
      setAccountInfo({
        name: props.name || "",
        email: props.email || "",
        emailVerification: props.emailVerification || false,
      });
    } else {
      async function fetchUser() {
        const res = await fetch("/api/auth/user", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setAccountInfo(data.user);
        } else {
          setAccountInfo(null);
        }
      }
      fetchUser();
    }
  }, [props.name, props.email, props.emailVerification]);


  return (
    <div className="relative">
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {accountInfo ? getInitials(accountInfo.name || "") : 'U'}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-stone-300">{accountInfo?.name || 'Loading...'}</p>
          <p className="text-xs text-stone-400">{accountInfo?.email || ''}</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-gray-600 duration-200 ease-in-out transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {accountInfo ? getInitials(accountInfo.name || "") : 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 truncate">{accountInfo?.name || 'Loading...'}</p>
                  <p className="text-sm text-gray-400 truncate">{accountInfo?.email || ''}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Profile */}
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/dashboard/profile');
                }}
              >
                <User className="w-4 h-4 mr-3" />
                View Profile
              </button>

              {/* Settings */}
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/dashboard/settings');
                }}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </button>

              {/* Theme Toggle */}
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={toggleTheme}
              >
                <div className="flex items-center">
                  {isDarkMode ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                  Theme
                </div>
                <span className="text-xs text-gray-500">
                  {isDarkMode ? 'Light' : 'Dark'}
                </span>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-700 my-2" />

              {/* Logout */}
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}