import { useEffect, useState } from 'react';
import { ALL_IDS } from '../content/nav';

/**
 * Scrollspy: the last heading whose top has passed the viewport midline is
 * the active section. Simple and robust for a single static page.
 */
export function useActiveSection(): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let raf = 0;

    const update = (): void => {
      const line = window.scrollY + window.innerHeight * 0.3;
      let current: string | null = null;
      for (const id of ALL_IDS) {
        const element = document.getElementById(id);
        if (element && element.offsetTop <= line) current = id;
      }
      // Near the very bottom, force the last section active.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 80) {
        current = ALL_IDS[ALL_IDS.length - 1];
      }
      setActiveId(current);
    };

    const onScroll = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return activeId;
}
