'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { Link, usePathname } from '@/i18n/routing';
import { mainNav } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * Sticky header.
 *
 * Transparent over the hero, then condenses to a frosted sand bar once the
 * visitor scrolls past ~24px. The scroll listener is passive and only ever
 * flips a boolean, so it can't stall the scroll thread.
 */
export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // Deep-links and refreshes can land mid-page.
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A route change should never leave the overlay stranded open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock the page behind the mobile overlay.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Over the hero the bar is dark-on-transparent; once condensed it's light.
  const overHero = !scrolled && !menuOpen;

  return (
    <>
      <a href="#main" className="sr-only sr-focusable">
        {t('skipToContent')}
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-rise',
          overHero
            ? 'bg-transparent py-3'
            : 'border-b border-sand-300/70 bg-sand-50/85 py-1 shadow-card backdrop-blur-xl',
        )}
      >
        <div className="shell flex h-[var(--header-height)] items-center justify-between gap-4">
          <Logo tone={overHero ? 'light' : 'dark'} />

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label={t('menu')}
          >
            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300',
                    overHero
                      ? 'text-sand-100 hover:text-gold-300'
                      : 'text-navy-600 hover:text-navy-900',
                    active && (overHero ? 'text-gold-300' : 'text-navy-900'),
                  )}
                >
                  {t(item.key)}
                  {active ? (
                    <motion.span
                      // Shared layoutId slides the underline between items
                      // instead of cross-fading two separate bars.
                      layoutId="nav-underline"
                      className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-gradient"
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 30 }
                      }
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher
              tone={overHero ? 'light' : 'dark'}
              className="hidden sm:inline-flex"
            />

            <ButtonLink
              href="/contact"
              size="sm"
              variant={overHero ? 'onDark' : 'primary'}
              className="hidden lg:inline-flex"
            >
              {t('cta')}
            </ButtonLink>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              className={cn(
                'grid size-11 place-items-center rounded-full border transition-colors lg:hidden',
                overHero
                  ? 'border-sand-50/25 text-sand-50 hover:bg-sand-50/10'
                  : 'border-sand-300 text-navy-800 hover:bg-sand-200',
              )}
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

// ── Mobile overlay ─────────────────────────────────────────────────────────

const panelVariants = {
  hidden: { opacity: 0, y: '-100%' },
  visible: {
    opacity: 1,
    y: '0%',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, staggerChildren: 0.06, delayChildren: 0.12 },
  },
  exit: { opacity: 0, y: '-100%', transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] as const } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0 },
};

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-menu"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-40 bg-navy-depth pt-[calc(var(--header-height)+1.5rem)] lg:hidden"
        >
          <nav
            className="shell flex h-full flex-col"
            aria-label={t('menu')}
          >
            <ul className="flex flex-col">
              {mainNav.map((item, index) => (
                <motion.li key={item.key} variants={itemVariants}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'flex items-baseline gap-4 border-b border-navy-600/50 py-5',
                      'font-display text-3xl font-bold transition-colors',
                      isActive(item.href)
                        ? 'text-gold-400'
                        : 'text-sand-50 hover:text-gold-300',
                    )}
                  >
                    <span className="numeric text-xs font-medium text-gold-600/70">
                      0{index + 1}
                    </span>
                    {t(item.key)}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-5">
              <ButtonLink href="/contact" size="lg" onClick={onClose}>
                {t('cta')}
              </ButtonLink>
              <LanguageSwitcher tone="light" className="self-start sm:hidden" />
            </motion.div>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
