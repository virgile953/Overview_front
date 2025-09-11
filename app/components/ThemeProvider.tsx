"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>('dark');

  useEffect(() => {
    // Get theme from cookie
    const cookieTheme = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme='))
      ?.split('=')[1] || 'dark';
    
    setTheme(cookieTheme);
    
    // Apply theme to document
    document.documentElement.className = cookieTheme;

    // Listen for theme changes
    const handleThemeChange = () => {
      const newTheme = document.cookie
        .split('; ')
        .find(row => row.startsWith('theme='))
        ?.split('=')[1] || 'dark';
      
      setTheme(newTheme);
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

  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('theme='))
                    ?.split('=')[1] || 'dark';
                  document.documentElement.className = theme;
                } catch (e) {
                  document.documentElement.className = 'dark';
                }
              })();
            `,
          }}
        />
      </head>
      {children}
    </html>
  );
}
