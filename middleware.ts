import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  /*
   * Run on every path except:
   *  - /studio      (Sanity Studio must never be locale-prefixed)
   *  - /api, /_next, /_vercel
   *  - anything with a file extension (static assets)
   */
  matcher: ['/((?!studio|api|_next|_vercel|.*\\..*).*)'],
};
