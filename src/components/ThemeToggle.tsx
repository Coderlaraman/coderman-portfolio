'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse">
        <div className="w-5 h-5 bg-neutral-400 dark:bg-neutral-600 rounded"></div>
      </div>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  const themes = [
    { value: 'light', icon: Sun, label: t('theme.light') },
    { value: 'dark', icon: Moon, label: t('theme.dark') },
    { value: 'system', icon: Monitor, label: t('theme.system') },
  ];

  return (
    <div className="relative group">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
        aria-label="Toggle theme"
      >
        {currentTheme === 'light' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-blue-400" />
        )}
      </button>
      
      <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center w-full px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-150 ${
                theme === themeOption.value
                  ? 'text-accent-blue dark:text-accent-blue bg-neutral-50 dark:bg-neutral-700/50'
                  : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {themeOption.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}