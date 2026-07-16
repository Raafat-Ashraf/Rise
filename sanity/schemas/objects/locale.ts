import { defineField, defineType } from 'sanity';

/**
 * Localised field types.
 *
 * Every editorial string on the site exists in both Arabic and English, so
 * rather than duplicating documents per locale we localise at the field level.
 * Arabic is the default market and is therefore listed (and validated) first.
 */

export const SUPPORTED_LOCALES = [
  { id: 'ar', title: 'العربية (Arabic)' },
  { id: 'en', title: 'English' },
] as const;

export const localeString = defineType({
  name: 'localeString',
  title: 'Localised text',
  type: 'object',
  options: { columns: 2 },
  fields: SUPPORTED_LOCALES.map((locale) =>
    defineField({
      name: locale.id,
      title: locale.title,
      type: 'string',
      // Arabic is the default locale — the site falls back to it, so it must exist.
      validation: (rule) => (locale.id === 'ar' ? rule.required() : rule),
    }),
  ),
});

export const localeText = defineType({
  name: 'localeText',
  title: 'Localised paragraph',
  type: 'object',
  fields: SUPPORTED_LOCALES.map((locale) =>
    defineField({
      name: locale.id,
      title: locale.title,
      type: 'text',
      rows: 5,
      validation: (rule) => (locale.id === 'ar' ? rule.required() : rule),
    }),
  ),
});
