/**
 * Sanity environment.
 *
 * The site is designed to run *without* Sanity credentials: when no project ID
 * is configured we serve the bundled demo portfolio instead (see
 * `lib/demo-data.ts`). That keeps `npm run dev` and `npm run build` working on a
 * fresh clone, and means the client can wire up Sanity whenever they're ready.
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || '2024-10-01';

/** True once a real Sanity project is wired up. */
export const isSanityConfigured = projectId.length > 0;

/** Studio lives at /studio, embedded in this Next.js app. */
export const studioBasePath = '/studio';

export function assertSanityConfigured(): void {
  if (!isSanityConfigured) {
    throw new Error(
      'Sanity is not configured. Copy .env.example to .env.local and set NEXT_PUBLIC_SANITY_PROJECT_ID.',
    );
  }
}
