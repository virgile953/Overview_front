'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { changeTheme } from "@/app/ui/actions/themeSwitcher";
import { useTheme } from 'next-themes';

const themes = [
  {
    key: 'system',
    icon: Monitor,
    label: 'System theme',
  },
  {
    key: 'light',
    icon: Sun,
    label: 'Light theme',
  },
  {
    key: 'dark',
    icon: Moon,
    label: 'Dark theme',
  },
];

export type ThemeSwitcherProps = {
  defaultValue?: 'light' | 'dark' | 'system';
  className?: string;
};

export const ThemeSwitcher = ({
  defaultValue = 'system',
  className,
}: ThemeSwitcherProps) => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  // Get initial theme from localStorage or use defaultValue
  const getInitialTheme = useCallback((): 'light' | 'dark' | 'system' => {
    if (typeof window === 'undefined') return defaultValue;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    return savedTheme || defaultValue;
  }, [defaultValue]);



  const applyTheme = useCallback((themeKey: 'light' | 'dark' | 'system') => {
    let effectiveTheme: 'light' | 'dark';

    if (themeKey === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = themeKey;
    }

    const isDark = effectiveTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', themeKey);
    changeTheme(themeKey);
  }, []);

  const handleThemeClick = useCallback(
    (themeKey: 'light' | 'dark' | 'system') => {
      setTheme(themeKey);
      applyTheme(themeKey);
    },
    [setTheme, applyTheme]
  );

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    // Apply the saved theme from localStorage
    const savedTheme = getInitialTheme();
    applyTheme(savedTheme);
  }, [getInitialTheme, applyTheme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border',
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => handleThemeClick(key as 'light' | 'dark' | 'system')}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 m-auto h-4 w-4',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
