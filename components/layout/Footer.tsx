import { useTranslations } from 'next-intl';
import { Facebook, Mail, MapPin, Phone } from 'lucide-react';

import { Link } from '@/i18n/routing';
import { mainNav, serviceLinks, socialLinks } from '@/lib/navigation';
import { contact, sanitizePhone } from '@/lib/utils';
import { Logo } from './Logo';
import { Newsletter } from './Newsletter';

// Amjad currently publishes one social channel. The footer maps over whatever
// `socialLinks` contains, so adding more later needs only a new entry here.
const socialIcons = {
  facebook: Facebook,
} as const;

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tServices = useTranslations('services.items');
  const tBrand = useTranslations('brand');
  const tContact = useTranslations('contact.info');

  const year = new Date().getFullYear();

  return (
    <footer className="theme-dark relative overflow-hidden bg-navy-depth text-sand-50">
      {/* Gold hairline echoing the arc under the logo's towers */}
      <div className="rule-gold" aria-hidden="true" />

      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-navy-300">
              {t('about')}
            </p>

            <ul className="mt-7 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.key];
                return (
                  <li key={social.key}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t(`social.${social.key}`)}
                      className="grid size-10 place-items-center rounded-full border border-navy-600
                                 text-navy-300 transition-all duration-300 ease-rise
                                 hover:-translate-y-1 hover:border-gold-500 hover:bg-gold-500/10
                                 hover:text-gold-400"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Explore */}
          <nav className="lg:col-span-2" aria-label={t('explore')}>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-gold-500">
              {t('explore')}
            </h3>
            <ul className="mt-5 space-y-3">
              {mainNav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="group inline-flex text-sm text-navy-300 transition-colors hover:text-sand-50"
                  >
                    <span className="relative">
                      {tNav(item.key)}
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-0.5 h-px origin-start scale-x-0
                                   bg-gold-500 transition-transform duration-300 ease-rise
                                   group-hover:scale-x-100"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav className="lg:col-span-3" aria-label={t('servicesTitle')}>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-gold-500">
              {t('servicesTitle')}
            </h3>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map((service) => (
                <li key={service.key}>
                  <Link
                    href={service.href}
                    className="group inline-flex text-sm text-navy-300 transition-colors hover:text-sand-50"
                  >
                    <span className="relative">
                      {tServices(`${service.key}.title`)}
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-0.5 h-px origin-start scale-x-0
                                   bg-gold-500 transition-transform duration-300 ease-rise
                                   group-hover:scale-x-100"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter + contact */}
          <div className="lg:col-span-3">
            <Newsletter />

            <ul className="mt-8 space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${sanitizePhone(contact.phone)}`}
                  className="flex items-center gap-3 text-navy-300 transition-colors hover:text-gold-400"
                >
                  <Phone className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                  <span className="numeric">{contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-navy-300 transition-colors hover:text-gold-400"
                >
                  <Mail className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                  <span dir="ltr">{contact.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-navy-300">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                <span className="whitespace-pre-line leading-relaxed">
                  {tContact('address')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-14 flex flex-col gap-4 border-t border-navy-600/60 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-navy-400">{t('rights', { year })}</p>

          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-600/80">
            {tBrand('tagline')}
          </p>

          <ul className="flex items-center gap-6 text-xs text-navy-400">
            <li>
              <Link href="/contact" className="transition-colors hover:text-sand-50">
                {t('privacy')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-sand-50">
                {t('terms')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
