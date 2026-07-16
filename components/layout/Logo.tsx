import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** `light` is for the navy header/footer; `dark` for sand backgrounds. */
  tone?: 'dark' | 'light';
  className?: string;
  /** Hides the wordmark, leaving just the mark. */
  markOnly?: boolean;
}

/**
 * The Rise logo.
 *
 * The master artwork (`/logo.png`) is a full lock-up — mark, wordmark and
 * slogan on white paper — which is far too tall for a 72px header and brings a
 * white plate with it. So `scripts/`-generated derivatives are used instead
 * (see the mark generator in the README): the mark is cut out of the lock-up
 * with the paper knocked out to transparency, and the wordmark is set in live
 * text beside it — crisp at any size, translatable, and readable to search
 * engines and screen readers.
 *
 * Two cut-outs exist because the mark is two-tone: its towers are the brand
 * navy, which would vanish against the navy header. `logo-mark-light.png` is
 * the same artwork with the navy recoloured to sand, leaving the gold alone.
 */
export function Logo({ tone = 'dark', className, markOnly = false }: LogoProps) {
  const t = useTranslations('brand');

  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-3 rounded-lg focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2',
        tone === 'light'
          ? 'focus-visible:ring-offset-navy-900'
          : 'focus-visible:ring-offset-sand-50',
        className,
      )}
      aria-label={`${t('name')} — ${t('tagline')}`}
    >
      {/*
        Both cut-outs are rendered and crossfaded rather than swapped by src.
        The header flips tone the moment it condenses on scroll; swapping the
        src would only start fetching the other mark at that instant, flashing
        an empty box. Stacked, they're both in the page from the first paint and
        the change rides along with the header's own transition. next/image
        serves each into a 48px box, so the pair costs a couple of kb.
      */}
      <span className="relative block size-11 shrink-0 sm:size-12">
        {(
          [
            { src: '/logo-mark-light.png', visible: tone === 'light' },
            { src: '/logo-mark.png', visible: tone === 'dark' },
          ] as const
        ).map((variant) => (
          <Image
            key={variant.src}
            src={variant.src}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="48px"
            className={cn(
              'object-contain transition-all duration-500 ease-rise group-hover:scale-[1.06]',
              variant.visible ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </span>

      {!markOnly ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display text-xl font-bold tracking-tight transition-colors sm:text-[1.4rem]',
              tone === 'light' ? 'text-sand-50' : 'text-navy-900',
            )}
          >
            {t('name')}
          </span>
          <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-gold-600">
            {t('tagline')}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
