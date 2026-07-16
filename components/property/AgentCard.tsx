import { useTranslations } from 'next-intl';
import { Mail, MessageCircle, Phone } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import type { Agent } from '@/lib/types';
import { contact, pick, sanitizePhone, whatsappUrl } from '@/lib/utils';

interface AgentCardProps {
  agent?: Agent;
  locale: Locale;
  /** Pre-fills the WhatsApp message with the property being viewed. */
  propertyTitle: string;
  reference?: string;
}

/**
 * The enquiry card on a property page.
 *
 * Falls back to the Rise desk when a listing has no advisor assigned, so the
 * contact route is never dead. Every channel is pre-filled with the property
 * reference — the advisor knows what the enquiry is about before they answer.
 */
export function AgentCard({
  agent,
  locale,
  propertyTitle,
  reference,
}: AgentCardProps) {
  const t = useTranslations('property.agent');

  const name = agent ? pick(agent.name, locale) : t('defaultName');
  const role = agent ? pick(agent.role, locale) : t('defaultRole');
  const phone = agent?.phone ?? contact.phone;
  const email = agent?.email ?? contact.email;
  const whatsapp = agent?.whatsapp ?? contact.whatsapp;

  const enquiry = reference
    ? `${propertyTitle} (${reference})`
    : propertyTitle;

  const prefill =
    locale === 'ar'
      ? `مرحباً ${name}، أودّ الاستفسار عن: ${enquiry}`
      : `Hello ${name}, I'd like to ask about: ${enquiry}`;

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

  return (
    <Card>
      <CardBody>
        <p className="text-label font-semibold uppercase text-gold-600">{t('title')}</p>

        <div className="mt-5 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-navy-900
                       font-display text-base font-bold text-gold-400"
          >
            {initials}
          </span>
          <div>
            <p className="font-display text-lg font-bold text-navy-900">{name}</p>
            <p className="text-sm text-navy-400">{role}</p>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-navy-400">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-gold-500 shadow-[0_0_0_3px_rgb(188_143_67/0.2)]"
          />
          {t('responseTime')}
        </p>

        <div className="mt-6 space-y-3">
          <ButtonLink
            href={whatsappUrl(whatsapp, prefill)}
            external
            target="_blank"
            rel="noopener noreferrer"
            size="md"
            className="w-full"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {t('whatsapp')}
          </ButtonLink>

          <div className="grid grid-cols-2 gap-3">
            <ButtonLink
              href={`tel:${sanitizePhone(phone)}`}
              external
              variant="outline"
              size="md"
              className="w-full"
            >
              <Phone className="size-4" aria-hidden="true" />
              {t('call')}
            </ButtonLink>

            <ButtonLink
              href={`mailto:${email}?subject=${encodeURIComponent(enquiry)}`}
              external
              variant="outline"
              size="md"
              className="w-full"
            >
              <Mail className="size-4" aria-hidden="true" />
              {t('email')}
            </ButtonLink>
          </div>

          <ButtonLink href="/contact" variant="secondary" size="md" className="w-full">
            {t('enquire')}
          </ButtonLink>
        </div>
      </CardBody>
    </Card>
  );
}
