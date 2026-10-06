import { ThemeToggle } from './ThemeToggle';

export function Header(): JSX.Element {
  return (
    <header className="site-header">
      <a className="site-logo" href="#overview">
        <span className="site-logo-mark" aria-hidden>
          ✦
        </span>
        AI Composer
      </a>
      <nav aria-label="Primary">
        <a href="#demos">Demos</a>
        <a href="#templates">Templates</a>
        <a href="#scenarios">Scenarios</a>
        <a href="#api">API</a>
        <a href="#theming">Theming</a>
        <a href="#frameworks">Frameworks</a>
        <a href="#storybooks">Storybooks</a>
      </nav>
      <span className="spacer" />
      <a
        className="github-link"
        href="https://github.com/deepakcho/AIComposer"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="AI Composer source code on GitHub"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.05.78 2.12 0 1.54-.01 2.77-.01 3.15 0 .3.2.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        GitHub
      </a>
      <a
        className="github-link npm-link"
        href="https://www.npmjs.com/org/ai-composer"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="AI Composer packages on npm"
      >
        npm packages
      </a>
      <ThemeToggle />
    </header>
  );
}
