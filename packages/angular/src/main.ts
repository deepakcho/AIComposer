/**
 * Storybook host bootstrap (browserTarget for @storybook/angular builders).
 * Storybook replaces this at runtime — it only needs to compile.
 */
import 'zone.js';

export default async function bootstrap(): Promise<void> {
  // Intentionally minimal; Storybook renders stories, not this shell.
}

void bootstrap;
