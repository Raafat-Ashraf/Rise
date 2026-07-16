import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

import { locales } from '@/i18n/routing';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/contact/ContactForm';
import { PropertyMap } from '@/components/property/PropertyMap';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import {
  absoluteUrl,
  contact,
  officeGeo,
  sanitizePhone,
  whatsappUrl,
} from '@/lib/utils';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.contact' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: absoluteUrl(`/${locale}/contact`),
      languages: { ar: absoluteUrl('/ar/contact'), en: absoluteUrl('/en/contact') },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: absoluteUrl(`/${locale}/contact`),
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contact' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tWhats = await getTranslations({ locale, namespace: 'whatsapp' });

  const channels = [
    {
      icon: Phone,
      label: t('info.phoneLabel'),
      value: contact.phone,
      href: `tel:${sanitizePhone(contact.phone)}`,
      numeric: true,
    },
    {
      icon: MessageCircle,
      label: t('info.whatsappLabel'),
      value: contact.phone,
      href: whatsappUrl(contact.whatsapp, tWhats('prefill')),
      numeric: true,
      external: true,
    },
    {
      icon: Mail,
      label: t('info.emailLabel'),
      value: contact.email,
      href: `mailto:${contact.email}`,
      numeric: false,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: tNav('home'), url: absoluteUrl(`/${locale}`) },
          { name: tNav('contact'), url: absoluteUrl(`/${locale}/contact`) },
        ]}
      />

      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('lead')}
        image="/images/properties/office-1.jpg"
      />

      <section className="bg-sand-50 py-section">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Form */}
            <div className="lg:col-span-7">
              <Reveal>
                <ContactForm />
              </Reveal>
            </div>

            {/* Office info */}
            <aside className="lg:col-span-5">
              <Reveal direction="end">
                <div className="rounded-card border border-sand-300 bg-sand-100 p-7">
                  <h2 className="font-display text-xl font-bold text-navy-900">
                    {t('info.title')}
                  </h2>

                  <ul className="mt-6 space-y-5">
                    {channels.map((channel) => (
                      <li key={channel.label}>
                        <a
                          href={channel.href}
                          {...(channel.external
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                          className="group flex items-start gap-4"
                        >
                          <span
                            className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-900
                                       text-gold-400 transition-colors duration-300
                                       group-hover:bg-gold-gradient group-hover:text-navy-950"
                            aria-hidden="true"
                          >
                            <channel.icon className="size-5" />
                          </span>

                          <span>
                            <span className="block text-xs font-medium uppercase tracking-wider text-navy-400">
                              {channel.label}
                            </span>
                            <span
                              className={`block font-semibold text-navy-900 transition-colors
                                          group-hover:text-gold-700 ${
                                            channel.numeric ? 'numeric' : ''
                                          }`}
                              dir="ltr"
                            >
                              {channel.value}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}

                    {/* Address */}
                    <li className="flex items-start gap-4">
                      <span
                        className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-900 text-gold-400"
                        aria-hidden="true"
                      >
                        <MapPin className="size-5" />
                      </span>
                      <span>
                        <span className="block text-xs font-medium uppercase tracking-wider text-navy-400">
                          {t('info.addressLabel')}
                        </span>
                        <span className="mt-0.5 block whitespace-pre-line leading-relaxed text-navy-700">
                          {t('info.address')}
                        </span>
                      </span>
                    </li>

                    {/* Hours */}
                    <li className="flex items-start gap-4">
                      <span
                        className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-900 text-gold-400"
                        aria-hidden="true"
                      >
                        <Clock className="size-5" />
                      </span>
                      <span>
                        <span className="block text-xs font-medium uppercase tracking-wider text-navy-400">
                          {t('info.hoursLabel')}
                        </span>
                        <span className="mt-0.5 block whitespace-pre-line leading-relaxed text-navy-700">
                          {t('info.hours')}
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>
              </Reveal>
            </aside>
          </div>

          {/* Map */}
          <Reveal className="mt-14">
            <h2 className="font-display text-2xl font-bold text-navy-900">
              {t('map.title')}
            </h2>
            <div className="mt-6">
              <PropertyMap
                lat={officeGeo.lat}
                lng={officeGeo.lng}
                label={t('info.address').split('\n')[0]}
                title={t('map.title')}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
