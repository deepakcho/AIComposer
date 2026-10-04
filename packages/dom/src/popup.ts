/**
 * Caret-anchored popup positioning. The suggestion menu opens where the
 * trigger key (@, /, …) was hit — not just above the box — and reflows:
 *
 *   - horizontal: popup's left edge follows the caret, clamped into the
 *     viewport so it never opens out of the window
 *   - vertical: prefers `placement` (Copilot-style: above), flips to the
 *     other side when the viewport lacks room, caps its max-height to the
 *     available space and scrolls inside
 *   - repositions on window resize and on any scroll (capture) while open
 *
 * The popup must live inside a positioned ancestor (`.aic-input-wrap`) —
 * coordinates are computed relative to that offset parent each update.
 */

export interface CaretPoint {
  /** Viewport x of the caret. */
  x: number;
  /** Viewport y of the caret line's top / bottom. */
  top: number;
  bottom: number;
}

export interface CaretAnchor {
  /** Recompute position (call after content/visibility changes). */
  update(): void;
  destroy(): void;
}

export interface CaretAnchorOptions {
  /** Preferred side; flips automatically when the viewport lacks room. */
  placement?: 'above' | 'below';
}

const GAP = 6;
const EDGE = 8;

/** Measure the caret inside a contenteditable host (viewport coordinates). */
export function measureCaret(host: HTMLElement): CaretPoint | null {
  const doc = host.ownerDocument;
  const win = doc.defaultView;
  if (!win) return null;
  const selection = win.getSelection();
  if (selection && selection.rangeCount > 0 && host.contains(selection.focusNode)) {
    const range = selection.getRangeAt(0).cloneRange();
    const rects = range.getClientRects();
    if (rects.length > 0) {
      const rect = rects[0];
      return { x: rect.left, top: rect.top, bottom: rect.bottom };
    }
    // Collapsed caret at an element boundary reports no rects — probe with a
    // zero-width marker and remove it synchronously (no input event fires,
    // so the editor's view pipeline is never involved).
    const marker = doc.createElement('span');
    marker.textContent = '​';
    try {
      range.insertNode(marker);
      const rect = marker.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return null;
      return { x: rect.left, top: rect.top, bottom: rect.bottom };
    } catch {
      return null;
    } finally {
      marker.remove();
    }
  }
  return null;
}

/** Fallback: the first text line's start (empty host, no selection). */
function firstLine(host: HTMLElement): CaretPoint {
  const rect = host.getBoundingClientRect();
  const style = host.ownerDocument.defaultView?.getComputedStyle(host);
  const padLeft = Number.parseFloat(style?.paddingLeft ?? '0') || 0;
  const padTop = Number.parseFloat(style?.paddingTop ?? '0') || 0;
  return { x: rect.left + padLeft, top: rect.top + padTop, bottom: rect.top + padTop + 22 };
}

export function attachCaretAnchoredPopup(
  popup: HTMLElement,
  host: HTMLElement,
  options: CaretAnchorOptions = {},
): CaretAnchor {
  const win = host.ownerDocument.defaultView ?? window;
  const prefer = options.placement ?? 'above';
  const scrollOptions: AddEventListenerOptions & EventListenerOptions = {
    capture: true,
    passive: true,
  };

  const update = (): void => {
    if (popup.hidden) return;
    const viewportWidth = win.innerWidth;
    const viewportHeight = win.innerHeight;

    const width = Math.max(180, Math.min(360, viewportWidth - EDGE * 2));
    popup.style.position = 'absolute';
    popup.style.width = `${Math.round(width)}px`;
    popup.style.margin = '0';
    popup.style.zIndex = 'var(--aic-z-suggestions)';

    // Measure the anchor AFTER taking the popup out of flow — otherwise the
    // wrap's rect still includes the freshly-opened list and the popup
    // detaches by exactly its own height.
    const wrap = popup.parentElement ?? host;
    const wrapRect = wrap.getBoundingClientRect();
    const point = measureCaret(host) ?? firstLine(host);

    // Horizontal — under the caret, clamped so the popup stays on screen.
    const desiredLeft = point.x - wrapRect.left - 4;
    const absoluteLeft = Math.min(
      Math.max(wrapRect.left + desiredLeft, EDGE),
      viewportWidth - width - EDGE,
    );
    popup.style.left = `${Math.round(absoluteLeft - wrapRect.left)}px`;
    popup.style.right = 'auto';

    // Vertical — preferred side first, flip when the viewport lacks room.
    popup.style.maxHeight = '';
    const needed = Math.min(popup.offsetHeight || 200, 260);
    const spaceAbove = point.top - EDGE;
    const spaceBelow = viewportHeight - point.bottom - EDGE;
    let side = prefer;
    const wanted = Math.min(needed, 140);
    if (side === 'above' && spaceAbove < wanted && spaceBelow > spaceAbove) side = 'below';
    else if (side === 'below' && spaceBelow < wanted && spaceAbove > spaceBelow) side = 'above';

    const available = Math.max(
      96,
      Math.min(260, (side === 'above' ? spaceAbove : spaceBelow) - GAP),
    );
    popup.style.maxHeight = `${Math.round(available)}px`;
    if (side === 'above') {
      popup.style.bottom = `${Math.round(wrapRect.bottom - point.top + GAP)}px`;
      popup.style.top = 'auto';
    } else {
      popup.style.top = `${Math.round(point.bottom - wrapRect.top + GAP)}px`;
      popup.style.bottom = 'auto';
    }
  };

  const onReflow = (): void => update();
  win.addEventListener('resize', onReflow);
  win.addEventListener('scroll', onReflow, scrollOptions);

  return {
    update,
    destroy() {
      win.removeEventListener('resize', onReflow);
      win.removeEventListener('scroll', onReflow, scrollOptions);
    },
  };
}
