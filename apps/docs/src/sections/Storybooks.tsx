/**
 * Embedded Storybooks — the real built Storybook bundles for every adapter,
 * served from the docs site itself (relative paths → GitHub Pages-safe).
 *
 * Build order: `pnpm storybook:build` (dist/storybook/*) then `pnpm docs:build`
 * (the vite plugin copies the bundles into the docs output).
 */

import { useEffect, useRef, useState } from 'react';

const BOOKS = [
  { id: 'react', label: 'React', path: './storybook/react/index.html' },
  { id: 'vue', label: 'Vue', path: './storybook/vue/index.html' },
  { id: 'angular', label: 'Angular', path: './storybook/angular/index.html' },
  { id: 'web-component', label: 'Web Component', path: './storybook/web-component/index.html' },
] as const;

export function Storybooks(): JSX.Element {
  const [active, setActive] = useState<(typeof BOOKS)[number]['id']>('react');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const activeBook = BOOKS.find((book) => book.id === active) ?? BOOKS[0];

  useEffect(() => {
    const syncFullscreen = (): void => {
      setIsFullscreen(document.fullscreenElement === embedRef.current);
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleFullscreen = async (): Promise<void> => {
    if (document.fullscreenElement === embedRef.current) {
      await document.exitFullscreen();
    } else {
      await embedRef.current?.requestFullscreen();
    }
  };

  return (
    <section className="section" id="storybooks">
      <h2>
        Storybooks{' '}
        <a className="section-anchor" href="#storybooks" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        The full Storybook for every adapter — the same stories the packages ship — embedded right
        here. The bundles are served from this site (relative paths), so they work on GitHub Pages
        or any static host.
      </p>

      <div className="sb-embed" ref={embedRef}>
        <div className="sb-embed-bar">
          <div className="tabs" role="tablist" aria-label="Adapter storybook">
            {BOOKS.map((book) => (
              <button
                key={book.id}
                type="button"
                role="tab"
                aria-selected={active === book.id}
                className={`tab${active === book.id ? ' active' : ''}`}
                onClick={() => setActive(book.id)}
              >
                {book.label}
              </button>
            ))}
          </div>
          <button
            className="sb-fullscreen"
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? 'Exit fullscreen Storybook' : 'Open Storybook fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
          >
            {isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
          </button>
        </div>
        <div className="sb-embed-frame">
          {/* key remounts the iframe per book so each bundle boots cleanly */}
          <iframe
            key={activeBook.id}
            src={activeBook.path}
            title={`${activeBook.label} Storybook`}
            loading="lazy"
            className="sb-iframe"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
