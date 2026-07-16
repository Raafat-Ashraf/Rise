import { z } from 'zod';

/**
 * Contact form schema.
 *
 * Built as a factory so the messages come from next-intl rather than being
 * hardcoded in English — the same schema instance validates on the client (via
 * react-hook-form) and again in the server action, so a crafted POST that skips
 * the browser still hits the same rules.
 */

export const INTEREST_VALUES = [
  'investment',
  'buying',
  'selling',
  'management',
  'consulting',
  'other',
] as const;

export const BUDGET_VALUES = [
  'under5',
  '5to15',
  '15to40',
  'over40',
  'undecided',
] as const;

export type Interest = (typeof INTEREST_VALUES)[number];
export type Budget = (typeof BUDGET_VALUES)[number];

/** Translator shape — matches next-intl's `useTranslations` return value. */
type Translate = (key: string) => string;

export function createContactSchema(t: Translate) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t('nameMin'))
      .max(80, t('nameMax')),

    email: z.string().trim().email(t('emailInvalid')),

    phone: z
      .string()
      .trim()
      // Optional, but must look like a phone number if provided.
      .regex(/^[+\d][\d\s()-]{6,19}$/, t('phoneInvalid'))
      .optional()
      .or(z.literal('')),

    interest: z.enum(INTEREST_VALUES, {
      errorMap: () => ({ message: t('interestRequired') }),
    }),

    budget: z.enum(BUDGET_VALUES).optional().or(z.literal('')),

    message: z
      .string()
      .trim()
      .min(10, t('messageMin'))
      .max(1000, t('messageMax')),

    consent: z.literal(true, {
      errorMap: () => ({ message: t('consentRequired') }),
    }),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
