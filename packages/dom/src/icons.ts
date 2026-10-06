/**
 * Inline SVG icons for the default mount UI (lucide-derived geometry).
 * Built with createElementNS so no innerHTML parsing is involved.
 */

type IconPaths = Array<Array<[string, Record<string, string | number>]>>;

const ICON_PATHS: Record<'send' | 'undo' | 'redo' | 'close', IconPaths> = {
  send: [
    [['M12 19V5', { 'stroke-width': 2.4 }], ['m5 12 7-7 7 7', { 'stroke-width': 2.4 }]],
  ],
  undo: [
    [['M3 7v6h6', {}], ['M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13', {}]],
  ],
  redo: [
    [['M21 7v6h-6', {}], ['M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13', {}]],
  ],
  close: [[['M18 6 6 18', {}], ['m6 6 12 12', {}]]],
};

const SVG_NS = 'http://www.w3.org/2000/svg';

export function createIcon(name: keyof typeof ICON_PATHS, size = 16): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  for (const [d, attributes] of ICON_PATHS[name].flat()) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    for (const [key, value] of Object.entries(attributes)) {
      path.setAttribute(key, String(value));
    }
    svg.appendChild(path);
  }
  return svg;
}

/** Loading state for the send button (animated in themes css). */
export function createSpinner(): HTMLSpanElement {
  const spinner = document.createElement('span');
  spinner.className = 'aic-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  return spinner;
}
