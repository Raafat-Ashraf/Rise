'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { Modal } from '@/components/ui/Modal';
import type { PropertyImage } from '@/lib/types';
import { cn, pick } from '@/lib/utils';

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
  locale: Locale;
}

/**
 * Property gallery + lightbox.
 *
 * A hero shot with a thumbnail rail, opening into a full-screen lightbox with
 * arrow-key navigation. The lightbox reuses <Modal>, which brings the focus
 * trap, Escape handling and scroll lock with it.
 */
export function PropertyGallery({ images, title, locale }: PropertyGalleryProps) {
  const t = useTranslations('property.gallery');
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;

  const go = useCallback(
    (next: number) => setActive((next + count) % count),
    [count],
  );

  // Arrow keys drive the lightbox. Bound only while it's open so they don't
  // hijack the page's normal scrolling.
  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(active + 1);
      if (event.key === 'ArrowLeft') go(active - 1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, go, lightboxOpen]);

  if (count === 0) return null;

  const current = images[active];

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-4">
        {/* Hero shot */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={t('open')}
          className="group relative col-span-full aspect-[16/10] overflow-hidden rounded-card
                     bg-sand-200 lg:col-span-3 lg:aspect-[4/3]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={current.url}
                alt={pick(current.alt, locale)}
                fill
                priority
                sizes="(min-width: 1024px) 70vw, 100vw"
                placeholder={current.lqip ? 'blur' : undefined}
                blurDataURL={current.lqip}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-navy-950/0 transition-colors duration-500
                       group-hover:bg-navy-950/20"
          />

          <span
            aria-hidden="true"
            className="absolute end-4 top-4 flex items-center gap-2 rounded-full bg-navy-950/70 px-4
                       py-2 text-xs font-semibold text-sand-50 backdrop-blur transition-colors
                       group-hover:bg-gold-gradient group-hover:text-navy-950"
          >
            <Expand className="size-4" />
            {t('viewAll', { count })}
          </span>

          <span
            aria-hidden="true"
            className="numeric absolute bottom-4 start-4 rounded-full bg-navy-950/70 px-3 py-1.5
                       text-xs font-medium text-sand-50 backdrop-blur"
          >
            {t('counter', { current: active + 1, total: count })}
          </span>
        </button>

        {/* Thumbnail rail — horizontal scroll on mobile, column on desktop */}
        {count > 1 ? (
          <ul
            className="col-span-full flex gap-3 overflow-x-auto pb-2 lg:col-span-1 lg:flex-col
                       lg:overflow-visible lg:pb-0"
          >
            {images.map((image, index) => (
              <li key={`${image.url}-${index}`} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={t('thumbnailAlt', { title, index: index + 1 })}
                  aria-current={index === active ? 'true' : undefined}
                  className={cn(
                    'relative aspect-[4/3] w-28 overflow-hidden rounded-xl border-2 transition-all',
                    'duration-300 ease-rise hover:opacity-100 lg:w-full',
                    index === active
                      ? 'border-gold-500 opacity-100'
                      : 'border-transparent opacity-60',
                  )}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, 112px"
                    placeholder={image.lqip ? 'blur' : undefined}
                    blurDataURL={image.lqip}
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Lightbox */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        label={title}
        closeLabel={t('close')}
        variant="full"
      >
        <div className="relative flex size-full flex-col items-center justify-center gap-4">
          <div className="relative max-h-[78vh] w-full max-w-6xl grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={current.url}
                  alt={pick(current.alt, locale)}
                  fill
                  sizes="100vw"
                  quality={90}
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(active - 1)}
                aria-label={t('previous')}
                className="absolute start-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center
                           rounded-full bg-navy-900/70 text-sand-50 backdrop-blur transition-colors
                           hover:bg-gold-500 hover:text-navy-950 sm:start-6"
              >
                <ChevronLeft className="size-6 rtl:-scale-x-100" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label={t('next')}
                className="absolute end-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center
                           rounded-full bg-navy-900/70 text-sand-50 backdrop-blur transition-colors
                           hover:bg-gold-500 hover:text-navy-950 sm:end-6"
              >
                <ChevronRight className="size-6 rtl:-scale-x-100" aria-hidden="true" />
              </button>

              <p
                className="numeric shrink-0 rounded-full bg-navy-900/70 px-4 py-2 text-sm
                           font-medium text-sand-50 backdrop-blur"
                aria-live="polite"
              >
                {t('counter', { current: active + 1, total: count })}
              </p>
            </>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
