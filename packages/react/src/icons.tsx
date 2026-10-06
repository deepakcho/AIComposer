/**
 * Inline SVG icons for the default UI (lucide-derived geometry, no
 * dependency). Apps replacing the toolbar never load these — tree-shaken.
 */

function Svg({ children, ...props }: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Send — arrow up, the circular-button glyph. */
export function SendIcon(): JSX.Element {
  return (
    <Svg strokeWidth="2.4">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </Svg>
  );
}

export function UndoIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </Svg>
  );
}

export function RedoIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </Svg>
  );
}

export function CloseIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <Svg width="12" height="12" {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  );
}

/** Loading state for the send button (animated in themes css). */
export function SpinnerIcon(): JSX.Element {
  return <span className="aic-spinner" aria-hidden="true" />;
}
