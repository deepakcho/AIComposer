import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './icons';

const STORAGE_KEY = 'aic-docs-theme';

export function ThemeToggle(): JSX.Element {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === STORAGE_KEY) {
        setDark(document.documentElement.classList.contains('dark'));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = (): void => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.setAttribute('data-aic-theme', next ? 'dark' : 'light');
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    setDark(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggle}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
