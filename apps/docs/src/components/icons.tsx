/** Inline SVG icons for the docs site (lucide-derived geometry, no dep). */

function Svg({ children, size = 16, ...props }: {
  children: React.ReactNode;
  size?: number;
} & React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
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

export function CopyIcon(): JSX.Element {
  return (
    <Svg size={14}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </Svg>
  );
}

export function CheckIcon(): JSX.Element {
  return (
    <Svg size={14}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

export function SunIcon(): JSX.Element {
  return (
    <Svg size={15}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </Svg>
  );
}

export function MoonIcon(): JSX.Element {
  return (
    <Svg size={15}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Svg>
  );
}

export function PlusIcon(): JSX.Element {
  return (
    <Svg size={16}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Svg>
  );
}

export function PaperclipIcon(): JSX.Element {
  return (
    <Svg size={16}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </Svg>
  );
}

export function ArrowUpIcon(): JSX.Element {
  return (
    <Svg size={16}>
      <path d="M12 19V5" strokeWidth="2.4" />
      <path d="m5 12 7-7 7 7" strokeWidth="2.4" />
    </Svg>
  );
}

export function ChevronDownIcon(): JSX.Element {
  return (
    <Svg size={13}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function SparklesIcon(): JSX.Element {
  return (
    <Svg size={13}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </Svg>
  );
}

export function SearchIcon(): JSX.Element {
  return (
    <Svg size={16}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function CornerDownLeftIcon(): JSX.Element {
  return (
    <Svg size={12}>
      <polyline points="9 10 4 15 9 20" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </Svg>
  );
}

export function FileIcon(): JSX.Element {
  return (
    <Svg size={13}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </Svg>
  );
}

export function ImageIcon(): JSX.Element {
  return (
    <Svg size={13}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </Svg>
  );
}
