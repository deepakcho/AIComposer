/** Single-page navigation model — drives both the sidebar and the TOC. */

export interface NavEntry {
  id: string;
  label: string;
}

export interface NavGroup {
  title: string;
  entries: NavEntry[];
  /** Nested h3 anchors shown in the TOC under this entry. */
  children?: NavEntry[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Getting started',
    entries: [
      { id: 'overview', label: 'Introduction' },
      { id: 'installation', label: 'Installation' },
      { id: 'quick-start', label: 'Quick start' },
    ],
  },
  {
    title: 'Demos',
    entries: [{ id: 'demos', label: 'Live demos' }],
    children: [
      { id: 'demo-basic', label: 'Basic' },
      { id: 'demo-modes', label: 'Modes' },
      { id: 'demo-triggers', label: 'Mentions & commands' },
      { id: 'demo-attachments', label: 'Attachments' },
      { id: 'demo-states', label: 'States' },
      { id: 'demo-controlled', label: 'Controlled' },
      { id: 'demo-hashtag', label: 'Custom trigger & node' },
      { id: 'demo-custom-suggestions', label: 'Custom suggestions' },
      { id: 'demo-serialization', label: 'Serialization' },
    ],
  },
  {
    title: 'Templates & scenarios',
    entries: [
      { id: 'templates', label: 'Custom templates' },
      { id: 'template-tutorial', label: 'Full template tutorial' },
      { id: 'scenarios', label: 'Real scenarios' },
    ],
    children: [
      { id: 'template-chat', label: 'Chat composer' },
      { id: 'template-search', label: 'Search bar' },
      { id: 'template-ticket', label: 'Ticket reply' },
      { id: 'template-comment', label: 'Inline comment' },
      { id: 'scenario-chat', label: 'Support chat' },
    ],
  },
  {
    title: 'API reference',
    entries: [{ id: 'api', label: 'API reference' }],
    children: [
      { id: 'api-props', label: 'AIComposer props' },
      { id: 'api-slots', label: 'Slot components' },
      { id: 'api-hooks', label: 'Hooks' },
      { id: 'api-core', label: 'Core engine' },
      { id: 'api-document', label: 'Document model' },
      { id: 'api-events', label: 'Events' },
      { id: 'api-commands', label: 'Commands' },
      { id: 'api-plugins', label: 'Plugins' },
      { id: 'api-serialization', label: 'Serialization' },
      { id: 'api-ai-integration', label: 'AI service handoff' },
    ],
  },
  {
    title: 'Styling & integrations',
    entries: [
      { id: 'theming', label: 'Theming & tokens' },
      { id: 'styling-tutorial', label: 'Styling tutorial' },
      { id: 'frameworks', label: 'Other frameworks' },
      { id: 'storybooks', label: 'Storybooks' },
    ],
    children: [
      { id: 'framework-react', label: 'React' },
      { id: 'framework-vue', label: 'Vue' },
      { id: 'framework-angular', label: 'Angular' },
      { id: 'framework-web-component', label: 'Web Component' },
      { id: 'framework-vanilla', label: 'Vanilla JS' },
    ],
  },
];

/** Flat list of every anchor id on the page (for the scrollspy). */
export const ALL_IDS: string[] = NAV.flatMap((group) => [
  ...group.entries.map((entry) => entry.id),
  ...(group.children ?? []).map((child) => child.id),
]);
