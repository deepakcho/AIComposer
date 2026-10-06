/**
 * Lazily-created Shiki highlighter with dual light/dark themes.
 *
 * Everything is behind a dynamic import: the grammars land in an async
 * chunk, so first paint never waits for the highlighter. Fine-grained
 * imports keep the bundle to exactly the grammars we render, and the
 * JavaScript regex engine avoids shipping the oniguruma wasm.
 */

import type { HighlighterCore } from 'shiki/core';

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [
        { createHighlighterCore },
        { createJavaScriptRegexEngine },
        { default: tsx },
        { default: ts },
        { default: js },
        { default: bash },
        { default: css },
        { default: html },
        { default: json },
        { default: githubLight },
        { default: githubDark },
      ] = await Promise.all([
        import('shiki/core'),
        import('shiki/engine/javascript'),
        import('shiki/langs/tsx.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/bash.mjs'),
        import('shiki/langs/css.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/json.mjs'),
        import('shiki/themes/github-light.mjs'),
        import('shiki/themes/github-dark.mjs'),
      ]);
      return createHighlighterCore({
        themes: [githubLight, githubDark],
        langs: [tsx, ts, js, bash, css, html, json],
        engine: createJavaScriptRegexEngine(),
      });
    })();
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
  });
}
