'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';

export function LanguageToggle() {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
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

  const languageNames = {
    en: t('language.english'),
    es: t('language.spanish'),
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
      </button>
      
      <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex items-center w-full px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-150 ${
              language === lang
                ? 'text-accent-blue dark:text-accent-blue bg-neutral-50 dark:bg-neutral-700/50'
                : 'text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <span className="mr-2">{lang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
            {languageNames[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}