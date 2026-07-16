'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { submitContactForm } from '@/app/actions/contact';
import {
  BUDGET_VALUES,
  INTEREST_VALUES,
  createContactSchema,
  type ContactFormValues,
} from '@/lib/contact-schema';

export function ContactForm() {
  const t = useTranslations('contact.form');
  const tValidation = useTranslations('contact.form.validation');
  const locale = useLocale();

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>({
    // The schema is rebuilt per render so its messages follow the active locale.
    resolver: zodResolver(createContactSchema(tValidation)),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      interest: undefined,
      budget: '',
      message: '',
      consent: false as unknown as true,
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    setStatus('idle');

    startTransition(async () => {
      const result = await submitContactForm(locale, values);

      if (result.ok) {
        setStatus('success');
        reset();
        return;
      }

      // Surface server-side field errors on the matching inputs; anything else
      // falls back to the generic banner.
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, message]) => {
          setError(field as keyof ContactFormValues, { type: 'server', message });
        });
        return;
      }

      setStatus('error');
    });
  };

  const interestOptions = INTEREST_VALUES.map((value) => ({
    value,
    label: t(`interest.options.${value}`),
  }));

  const budgetOptions = BUDGET_VALUES.map((value) => ({
    value,
    label: t(`budget.options.${value}`),
  }));

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
        className="rounded-card border border-gold-500/40 bg-gold-50 p-10 text-center"
      >
        <span
          className="mx-auto grid size-16 place-items-center rounded-full bg-gold-gradient text-navy-950"
          aria-hidden="true"
        >
          <CheckCircle2 className="size-8" />
        </span>

        <h2 className="mt-6 font-display text-2xl font-bold text-navy-900">
          {t('success.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-navy-500">{t('success.body')}</p>

        <div className="mt-8">
          <Button variant="outline" onClick={() => setStatus('idle')}>
            {t('success.again')}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-card border border-sand-300 bg-sand-50 p-6 shadow-card sm:p-9">
      <h2 className="font-display text-2xl font-bold text-navy-900">{t('title')}</h2>
      <p className="mt-2 text-sm text-navy-500">{t('description')}</p>

      <AnimatePresence>
        {status === 'error' ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-gold-700/40
                       bg-gold-50 p-4"
          >
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-gold-700"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-navy-900">{t('error.title')}</p>
              <p className="mt-1 text-sm text-navy-500">{t('error.body')}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={t('name.label')}
            placeholder={t('name.placeholder')}
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label={t('email.label')}
            placeholder={t('email.placeholder')}
            type="email"
            inputMode="email"
            autoComplete="email"
            // Email addresses are always LTR, even on an RTL page.
            dir="ltr"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={t('phone.label')}
            placeholder={t('phone.placeholder')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            optionalLabel={t('phone.optional')}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Select
            label={t('interest.label')}
            placeholder={t('interest.placeholder')}
            options={interestOptions}
            error={errors.interest?.message}
            {...register('interest')}
          />
        </div>

        <Select
          label={t('budget.label')}
          placeholder={t('budget.placeholder')}
          optionalLabel={t('budget.optional')}
          options={budgetOptions}
          error={errors.budget?.message}
          {...register('budget')}
        />

        <Textarea
          label={t('message.label')}
          placeholder={t('message.placeholder')}
          rows={6}
          error={errors.message?.message}
          {...register('message')}
        />

        <Checkbox
          label={t('consent')}
          error={errors.consent?.message}
          {...register('consent')}
        />

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            t('submitting')
          ) : (
            <>
              <Send className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              {t('submit')}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
