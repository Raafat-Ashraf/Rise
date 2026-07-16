/**
 * Site-level product switches.
 */

/**
 * Whether property prices are shown anywhere public.
 *
 * `false` puts the site in "price on request" mode — the standard play for
 * high-end stock, where the number is a reason to call rather than a filter to
 * bounce off. Turning this off hides:
 *
 *   - the price on every property card and detail page
 *   - the "/month" rent suffix
 *   - the price range slider in the filters
 *   - the price sort options
 *   - `offers.price` in the JSON-LD  ← the one that matters most: structured
 *     data is read by Google and would surface the price in search results even
 *     though it is hidden on the page.
 *
 * Prices are still authored in Sanity and still drive internal filtering — the
 * data is intact, it just isn't published. Flip this to `true` to bring it all
 * back in one move.
 */
export const SHOW_PRICES = false;
