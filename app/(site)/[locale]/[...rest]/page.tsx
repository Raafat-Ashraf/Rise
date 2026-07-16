import { notFound } from 'next/navigation';

/**
 * Catch-all for unmatched paths under a locale.
 *
 * Next resolves static and specific dynamic segments before this, so it only
 * ever fires for genuinely unknown URLs. It exists so those resolve to the
 * *localised* not-found page (with the header, footer and the visitor's
 * language) instead of Next's bare built-in 404.
 */
export default function CatchAllNotFound() {
  notFound();
}
