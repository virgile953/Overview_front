"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Settings, Moon, Sun, LogOut, ChevronRight } from "lucide-react";
import { Md5 } from 'ts-md5';
import Avatar from "@/app/ui/Avatar";
import { Separator } from "@/components/ui/separator";
import { changeTheme } from "../actions/themeSwitcher";

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
  const [verifyEmailSent, setVerifyEmailSent] = useState(false);

  // Gravatar state managed here
  const [gravatarUrl, setGravatarUrl] = useState<string | null>(null);
  const [gravatarExists, setGravatarExists] = useState<boolean>(false);
  const [gravatarLoading, setGravatarLoading] = useState<boolean>(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function toggleTheme() {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    document.documentElement.classList.toggle('dark', newIsDarkMode);
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
    changeTheme(newIsDarkMode ? 'dark' : 'light');
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

  useEffect(() => {
    if (accountInfo?.email) {
      setGravatarLoading(true);
      const emailHash = Md5.hashStr(accountInfo.email.trim().toLowerCase());
      const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=404&s=200`;

      setGravatarUrl(gravatarUrl);

      // Check if Gravatar exists
      checkGravatarExists(gravatarUrl).then(exists => {
        setGravatarExists(exists);
        setGravatarLoading(false);
      });
    }
  }, [accountInfo?.email]);

  useEffect(() => {
    const localTheme = localStorage.getItem('theme');
    const isDark = localTheme === 'dark';
    setIsDarkMode(isDark);
  }, []);

  const checkGravatarExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  //mail verification
  async function verifyEmail() {
    if (verifyEmailSent) return; // prevent multiple clicks
    const res = await fetch("/api/auth/user/verify-mail", { method: "POST" });
    if (res.ok) {
      setVerifyEmailSent(true);
    }
    console.log(res);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <Avatar
          email={accountInfo?.email}
          name={accountInfo?.name}
          gravatarUrl={gravatarUrl}
          gravatarExists={gravatarExists}
          gravatarLoading={gravatarLoading}
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground">{accountInfo?.name || 'Loading...'}</p>
          <p className="text-xs text-muted-foreground">{accountInfo?.email || ''}</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-accent-foreground duration-200 ease-in-out transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`}
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
          <div className="absolute right-0 mt-2 w-72 bg-transparent rounded-lg shadow-lg z-20">
            {/* User Info Header */}
            <div className="p-4 border-x border-t border-border rounded-t-lg bg-popover">
              <div className="flex items-center space-x-3">
                <Avatar
                  size="w-12 h-12"
                  textSize="text-lg"
                  email={accountInfo?.email}
                  name={accountInfo?.name}
                  gravatarUrl={gravatarUrl}
                  gravatarExists={gravatarExists}
                  gravatarLoading={gravatarLoading}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{accountInfo?.name || 'Loading...'}</p>
                  <p className="text-sm text-muted-foreground truncate">{accountInfo?.email || ''}</p>
                  {!accountInfo?.emailVerification && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-red-400 mt-1">Email not verified</p>
                      <button className="text-xs underline text-yellow-400 mt-1 cursor-pointer" onClick={verifyEmail}>verify</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Separator orientation="horizontal" className="h-px bg-border" />
            {/* Menu Items */}
            <div className="pt-2 bg-popover border-x border-b border-border rounded-b-lg overflow-hidden">
              {/* Profile */}
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-foreground
                 hover:bg-accent "
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
                className="w-full flex items-center px-4 py-2 text-sm text-foreground
                 hover:bg-accent "
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
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground
                 hover:bg-accent mb-2"
                onClick={toggleTheme}
              >
                <div className="flex items-center">
                  {isDarkMode ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                  Theme
                </div>
                <span className="text-xs text-foreground">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </button>
              <Separator orientation="horizontal" className="bg-border" />
              {/* Logout */}
              <button
                className="w-full flex items-center px-4 py-3 text-sm text-red-500 
                hover:bg-red-900/20 hover:text-red-300 "
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

