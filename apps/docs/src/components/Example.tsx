import { useState, type ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';

/**
 * The demo-showcase primitive: a titled live example with Preview / Code
 * tabs, mirroring the Storybook stories.
 */
export function Example({
  title,
  id,
  description,
  code,
  lang = 'tsx',
  children,
  plain = false,
}: {
  title?: string;
  id?: string;
  description?: ReactNode;
  code: string;
  lang?: string;
  children: ReactNode;
  /** Remove the padded card — the demo brings its own container. */
  plain?: boolean;
}): JSX.Element {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');

  return (
    <div id={id}>
      {title ? (
        <h3 className="example-title">{title}</h3>
      ) : null}
      {description ? <p className="example-desc">{description}</p> : null}
      <div className="example">
        <div className="example-tabs">
          <div className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'preview'}
              className={`tab${tab === 'preview' ? ' active' : ''}`}
              onClick={() => setTab('preview')}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'code'}
              className={`tab${tab === 'code' ? ' active' : ''}`}
              onClick={() => setTab('code')}
            >
              Code
            </button>
          </div>
        </div>
        {tab === 'preview' ? (
          <div className={`example-preview${plain ? ' plain' : ''}`}>{children}</div>
        ) : (
          <div className="example-code">
            <CodeBlock code={code} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}
