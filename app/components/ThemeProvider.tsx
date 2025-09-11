"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get theme from cookie
    const cookieTheme = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme='))
      ?.split('=')[1] || 'dark';
    
    // Apply theme to document
    document.documentElement.className = cookieTheme;

    // Listen for theme changes
    const handleThemeChange = () => {
      const newTheme = document.cookie
        .split('; ')
        .find(row => row.startsWith('theme='))
        ?.split('=')[1] || 'dark';
      
      document.documentElement.className = newTheme;
    };

    // Listen for storage events (theme changes in other tabs)
    window.addEventListener('storage', handleThemeChange);
    
    // Listen for custom theme change events
    window.addEventListener('themechange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
