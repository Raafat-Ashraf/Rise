import { defineField, defineType } from 'sanity';
import { UserRound } from 'lucide-react';

export const agent = defineType({
  name: 'agent',
  title: 'Advisor',
  type: 'document',
  icon: UserRound,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'International format, e.g. +20 100 000 0000',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp number',
      type: 'string',
      description: 'Digits only, no "+" or spaces — e.g. 201000000000',
      validation: (rule) =>
        rule.regex(/^\d{8,15}$/, {
          name: 'WhatsApp number',
          invert: false,
        }).warning('Should be 8–15 digits with no "+", spaces or dashes.'),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
  ],
  preview: {
    select: { title: 'name.en', subtitle: 'role.en', media: 'photo' },
  },
});
