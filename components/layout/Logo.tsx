import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** `light` is for the navy header/footer; `dark` for sand backgrounds. */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * The Amjad logo.
 *
 * The master artwork (`AmjadLogo.jpg`) is a serif wordmark — "AMJAD" over a
 * tracked "DEVELOPMENTS" caption — on an opaque cream field, with no separate
 * icon. `scripts/generate-logo-assets.ts` cuts the wordmark out and knocks the
 * cream paper out to transparency, producing two variants: the espresso ink
 * for light backgrounds, and a cream-recoloured copy for the dark header and
 * footer (where the dark ink would otherwise vanish).
 *
 * Because the mark IS the wordmark, it's shown at its natural ~2.9:1 aspect
 * ratio and carries the brand name itself — there's no separate text label
 * beside it to duplicate. The accessible name comes from the alt text.
 */
export function Logo({ tone = 'dark', className }: LogoProps) {
  const t = useTranslations('brand');

  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center rounded-lg focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2',
        tone === 'light'
          ? 'focus-visible:ring-offset-navy-900'
          : 'focus-visible:ring-offset-sand-50',
        className,
      )}
      aria-label={`${t('name')} — ${t('tagline')}`}
    >
      {/*
        Both variants are rendered and crossfaded rather than swapped by src.
        The header flips tone the moment it condenses on scroll; swapping the
        src would only start fetching the other variant at that instant,
        flashing an empty box. Stacked, both are in the page from first paint
        and the change rides along with the header's own transition.

        Natural aspect ratio is ~2.9:1 (1139x394); the fixed height with
        width:auto lets it lay out at the correct width without a wrapper box.
      */}
      <span className="relative block h-9 w-[104px] shrink-0 sm:h-10 sm:w-[116px]">
        {(
          [
            { src: '/logo-mark-light.png', visible: tone === 'light' },
            { src: '/logo-mark.png', visible: tone === 'dark' },
          ] as const
        ).map((variant) => (
          <Image
            key={variant.src}
            src={variant.src}
            alt={variant.visible ? `${t('name')} — ${t('tagline')}` : ''}
            aria-hidden={variant.visible ? undefined : true}
            fill
            priority
            sizes="120px"
            className={cn(
              'object-contain object-[left_center] transition-opacity duration-500 ease-rise',
              'rtl:object-[right_center]',
              variant.visible ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </span>
    </Link>
  );
}
