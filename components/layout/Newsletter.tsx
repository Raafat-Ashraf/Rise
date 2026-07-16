'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Footer newsletter sign-up.
 *
 * Validation and the success state are real; the submit is a local stub, since
 * the mailing provider is the client's to choose. Swap the `onSubmit` body for
 * a POST to a route handler once that's decided.
 */
export function Newsletter() {
  const t = useTranslations('footer.newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus('error');
      return;
    }

    setStatus('success');
    setEmail('');
  }

  return (
    <div>
      <h3 className="font-display text-lg font-bold text-sand-50">{t('title')}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-300">{t('description')}</p>

      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="mt-5 flex items-center gap-2 rounded-xl border border-gold-500/40
                       bg-gold-500/10 px-4 py-3 text-sm font-medium text-gold-300"
          >
            <Check className="size-4 shrink-0" aria-hidden="true" />
            {t('success')}
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={false}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            noValidate
            className="mt-5"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t('placeholder')}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder={t('placeholder')}
                  aria-invalid={status === 'error' ? true : undefined}
                  aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                  className={cn(
                    'h-12 w-full rounded-full border bg-navy-950/50 px-5 text-sm text-sand-50',
                    'placeholder:text-navy-400 focus:outline-none focus:ring-2',
                    'focus:ring-gold-500/50 transition-colors',
                    status === 'error'
                      ? 'border-gold-600'
                      : 'border-navy-600 focus:border-gold-500',
                  )}
                />
              </div>

              <button
                type="submit"
                aria-label={t('submitLabel')}
                className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-gradient
                           text-navy-950 shadow-gold transition-transform duration-300 ease-rise
                           hover:-translate-y-0.5 active:translate-y-0"
              >
                <ArrowRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
              </button>
            </div>

            {status === 'error' ? (
              <p id="newsletter-error" role="alert" className="mt-2 text-xs text-gold-400">
                {t('error')}
              </p>
            ) : (
              <p className="mt-2 text-xs text-navy-400">{t('privacy')}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
