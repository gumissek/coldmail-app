'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import translations, { type Lang } from '@/lib/translations';

type Theme = 'dark' | 'light';

interface SettingsContextType {
  theme: Theme;
  lang: Lang;
  toggleTheme: () => void;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const fallbackT = (key: string): string => translations['pl']?.[key] ?? key;

const fallbackSettings: SettingsContextType = {
  theme: 'dark',
  lang: 'pl',
  toggleTheme: () => {},
  setLang: () => {},
  t: fallbackT,
};

const SettingsContext = createContext<SettingsContextType>(fallbackSettings);

export function useSettings() {
  return useContext(SettingsContext);
}

export default function ThemeLanguageProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLangState] = useState<Lang>('pl');
  const [mounted, setMounted] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('coldmail-theme') as Theme | null;
    const savedLang = localStorage.getItem('coldmail-lang') as Lang | null;
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    if (savedLang === 'pl' || savedLang === 'en') setLangState(savedLang);
    setMounted(true);
  }, []);

  // Apply theme attribute
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('coldmail-theme', theme);
  }, [theme, mounted]);

  // Persist lang
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('coldmail-lang', lang);
  }, [lang, mounted]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const setLang = (l: Lang) => setLangState(l);

  const t = (key: string): string => {
    return translations[lang]?.[key] ?? translations['pl']?.[key] ?? key;
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <SettingsContext.Provider value={{ theme, lang, toggleTheme, setLang, t }}>
      {children}
    </SettingsContext.Provider>
  );
}
