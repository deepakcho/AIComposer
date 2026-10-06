import { useEffect, useState } from 'react';
import { highlight } from './code-highlight';
import { CheckIcon, CopyIcon } from './icons';

const SUPPORTED = new Set(['tsx', 'ts', 'bash', 'css', 'html', 'json']);

export function CodeBlock({ code, lang = 'tsx' }: { code: string; lang?: string }): JSX.Element {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!SUPPORTED.has(lang)) {
      setHtml(null);
      return;
    }
    highlight(code.trim(), lang)
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  const copy = (): void => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-language">{lang}</span>
        <button
          type="button"
          className="copy-btn"
          aria-label={copied ? 'Code copied' : 'Copy code'}
          title={copied ? 'Copied' : 'Copy code'}
          onClick={copy}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{code.trim()}</code>
        </pre>
      )}
    </div>
  );
}
