/**
 * @ai-composer/themes — design tokens and theme presets.
 *
 * Import CSS by entry (package exports `./css/*`):
 *
 *   import '@ai-composer/themes/css/tokens.css';
 *   import '@ai-composer/themes/css/default.css';   // structure, uses tokens
 *   import '@ai-composer/themes/css/dark.css';      // optional dark override
 *
 * Theme layers (ADR-0007):
 *   tokens → default → mode (compact) → app overrides → component overrides
 */

export const THEME_CSS_ENTRIES = ['tokens', 'default', 'dark', 'compact'] as const;

export type ThemeCssEntry = (typeof THEME_CSS_ENTRIES)[number];

/** Programmatically resolve a CSS import specifier (e.g. for bundler-resolved dynamic imports). */
export function themeCss(entry: ThemeCssEntry): string {
  return `@ai-composer/themes/css/${entry}.css`;
}

/** Token names emitted by tokens.css — useful for docs tooling and lint rules. */
export const DESIGN_TOKENS = [
  '--aic-background',
  '--aic-surface-raised',
  '--aic-surface-hover',
  '--aic-border',
  '--aic-border-focus',
  '--aic-text',
  '--aic-text-muted',
  '--aic-text-placeholder',
  '--aic-accent',
  '--aic-accent-hover',
  '--aic-accent-contrast',
  '--aic-accent-disabled',
  '--aic-chip-background',
  '--aic-chip-text',
  '--aic-chip-radius',
  '--aic-chip-mention-background',
  '--aic-chip-mention-text',
  '--aic-chip-command-background',
  '--aic-chip-command-text',
  '--aic-chip-variable-background',
  '--aic-chip-variable-text',
  '--aic-chip-hashtag-background',
  '--aic-chip-hashtag-text',
  '--aic-radius',
  '--aic-radius-sm',
  '--aic-border-width',
  '--aic-input-padding',
  '--aic-input-min-height',
  '--aic-input-max-height',
  '--aic-toolbar-height',
  '--aic-font-size',
  '--aic-font-family',
  '--aic-shadow',
  '--aic-shadow-raised',
  '--aic-focus-ring',
  '--aic-transition',
  '--aic-z-suggestions',
] as const;

export type DesignToken = (typeof DESIGN_TOKENS)[number];
