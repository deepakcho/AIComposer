import { CodeBlock } from '../components/CodeBlock';

export function Installation(): JSX.Element {
  return (
    <section className="section" id="installation">
      <h2>
        Installation <a className="section-anchor" href="#installation" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        One core engine, thin per-framework adapters, an optional theme. Install the adapter for
        your stack — everything else is shared.
      </p>

      <h3 className="sub">React</h3>
      <CodeBlock
        lang="bash"
        code={`npm install @ai-composer/core @ai-composer/dom @ai-composer/react

# triggers (optional, tree-shakeable)
npm install @ai-composer/plugin-mention @ai-composer/plugin-command

# ready-made styling (optional — the editor is token-based and unopinionated)
npm install @ai-composer/themes`}
      />

      <h3 className="sub">Styling</h3>
      <p className="prose-p">
        Import the theme CSS once at your app entry. Structure classes (<code>data-aic-*</code>)
        come from the DOM layer; every visual value is a CSS custom property.
      </p>
      <CodeBlock
        lang="tsx"
        code={`import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import '@ai-composer/themes/css/dark.css'; // optional dark override`}
      />

      <div className="callout">
        <span aria-hidden>ℹ</span>
        <span>
          <strong>Headless by design.</strong> The theme package is optional. If you skip it, the
          editor still works — bring your own CSS against the <code>data-aic-*</code> attributes
          and <code>aic-*</code> classes.
        </span>
      </div>

      <h3 className="sub">Other frameworks</h3>
      <p className="prose-p">
        Vue, Angular and Web Component adapters live in the same monorepo:{' '}
        <code>@ai-composer/vue</code>, <code>@ai-composer/angular</code>,{' '}
        <code>@ai-composer/web-component</code>. See <a href="#frameworks">Other frameworks</a>.
      </p>
    </section>
  );
}
