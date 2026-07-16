import { defineArrayMember, defineField, defineType } from 'sanity';
import { Building2 } from 'lucide-react';

export const PROPERTY_TYPES = [
  { title: 'Villa · فيلا', value: 'villa' },
  { title: 'Apartment · شقة', value: 'apartment' },
  { title: 'Penthouse · بنتهاوس', value: 'penthouse' },
  { title: 'Townhouse · تاون هاوس', value: 'townhouse' },
  { title: 'Chalet · شاليه', value: 'chalet' },
  { title: 'Office · مكتب', value: 'office' },
  { title: 'Retail · محل تجاري', value: 'retail' },
  { title: 'Land · أرض', value: 'land' },
] as const;

export const PROPERTY_STATUSES = [
  { title: 'For sale · للبيع', value: 'for-sale' },
  { title: 'For rent · للإيجار', value: 'for-rent' },
  { title: 'Off-plan · على الخارطة', value: 'off-plan' },
  { title: 'Sold · تم البيع', value: 'sold' },
] as const;

export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  icon: Building2,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'specs', title: 'Specs' },
    { name: 'media', title: 'Media' },
    { name: 'location', title: 'Location' },
    { name: 'meta', title: 'Publishing' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      group: 'content',
      description: 'The property name, e.g. "Rise Gardens Villa 12".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'content',
      description:
        'The web address for this property. Click Generate — it is built from the English title.',
      options: {
        source: (doc: Record<string, unknown>) => {
          const title = doc.title as { en?: string; ar?: string } | undefined;
          return title?.en || title?.ar || '';
        },
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .trim()
            // Keep Arabic letters, Latin letters and digits; everything else -> hyphen
            .replace(/[^\p{L}\p{N}]+/gu, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 96),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localeText',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'features',
      title: 'Features & amenities',
      type: 'array',
      group: 'content',
      description: 'Private pool, smart home, sea view…',
      of: [defineArrayMember({ type: 'localeString', name: 'feature' })],
      validation: (rule) => rule.max(20),
    }),

    // ── Specs ────────────────────────────────────────────────
    defineField({
      name: 'type',
      title: 'Property type',
      type: 'string',
      group: 'specs',
      options: { list: [...PROPERTY_TYPES], layout: 'dropdown' },
      initialValue: 'apartment',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'specs',
      options: { list: [...PROPERTY_STATUSES], layout: 'radio' },
      initialValue: 'for-sale',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (EGP)',
      type: 'number',
      group: 'specs',
      description:
        'For rentals this is the monthly rent. Leave empty to show "Price on request".',
      validation: (rule) => rule.min(0).positive(),
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      group: 'specs',
      validation: (rule) => rule.min(0).max(50).integer(),
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      group: 'specs',
      validation: (rule) => rule.min(0).max(50).integer(),
    }),
    defineField({
      name: 'area',
      title: 'Built area (m²)',
      type: 'number',
      group: 'specs',
      validation: (rule) => rule.required().min(1),
    }),

    // ── Media ────────────────────────────────────────────────
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'media',
      description:
        'The first image is used as the cover. Drag to reorder. Always write alt text — it is read aloud by screen readers.',
      of: [
        defineArrayMember({
          type: 'image',
          name: 'galleryImage',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'localeString',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1).max(24),
    }),

    // ── Location ─────────────────────────────────────────────
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      group: 'location',
      fields: [
        defineField({
          name: 'city',
          title: 'City',
          type: 'localeString',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'district',
          title: 'District / compound',
          type: 'localeString',
        }),
        defineField({
          name: 'lat',
          title: 'Latitude',
          type: 'number',
          description: 'From Google Maps: right-click the pin → copy the first number.',
          validation: (rule) => rule.min(-90).max(90),
        }),
        defineField({
          name: 'lng',
          title: 'Longitude',
          type: 'number',
          description: 'The second number from the same Google Maps pin.',
          validation: (rule) => rule.min(-180).max(180),
        }),
      ],
      validation: (rule) => rule.required(),
    }),

    // ── Publishing ───────────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Featured on the homepage',
      type: 'boolean',
      group: 'meta',
      description: 'Featured properties appear in the homepage highlight strip.',
      initialValue: false,
    }),
    defineField({
      name: 'reference',
      title: 'Reference code',
      type: 'string',
      group: 'meta',
      description: 'Internal code shown on the detail page, e.g. RISE-V-104.',
    }),
    defineField({
      name: 'agent',
      title: 'Advisor',
      type: 'reference',
      group: 'meta',
      to: [{ type: 'agent' }],
      description: 'Who handles enquiries for this property.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'meta',
      description: 'Drives "Newest first" sorting.',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],

  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Price, high to low',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }],
    },
    {
      title: 'Price, low to high',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      titleAr: 'title.ar',
      titleEn: 'title.en',
      city: 'location.city.en',
      status: 'status',
      price: 'price',
      featured: 'featured',
      media: 'gallery.0',
    },
    prepare({ titleAr, titleEn, city, status, price, featured, media }) {
      const label = PROPERTY_STATUSES.find((s) => s.value === status)?.title ?? status;
      const money =
        typeof price === 'number'
          ? new Intl.NumberFormat('en-EG', {
              style: 'currency',
              currency: 'EGP',
              maximumFractionDigits: 0,
            }).format(price)
          : 'On request';
      return {
        title: `${featured ? '★ ' : ''}${titleEn || titleAr || 'Untitled property'}`,
        subtitle: [label, city, money].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
