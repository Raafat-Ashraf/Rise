import { useTranslations } from 'next-intl';
import { ExternalLink, MapPin } from 'lucide-react';

import { googleMapsUrl, osmEmbedUrl } from '@/lib/utils';

interface PropertyMapProps {
  lat?: number;
  lng?: number;
  label: string;
  title?: string;
}

/**
 * Location map.
 *
 * Uses an OpenStreetMap embed rather than Google Maps: it needs no API key, so
 * the map works on a fresh clone and the client never has to hold billing
 * credentials for a static pin. The "open in Google Maps" link still hands off
 * to Google for directions, which is what people actually want the pin for.
 */
export function PropertyMap({ lat, lng, label, title }: PropertyMapProps) {
  const t = useTranslations('property.map');

  if (lat === undefined || lng === undefined) {
    return (
      <div className="rounded-card border border-dashed border-sand-400 bg-sand-100 p-8 text-center">
        <MapPin className="mx-auto size-6 text-navy-300" aria-hidden="true" />
        <p className="mt-3 text-sm text-navy-400">{t('unavailable')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-sand-300 shadow-card">
      <iframe
        src={osmEmbedUrl(lat, lng)}
        title={title ?? t('title')}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[16/10] w-full border-0 bg-sand-200 sm:aspect-[2/1]"
      />

      <div className="flex items-center justify-between gap-4 border-t border-sand-300 bg-sand-50 px-5 py-4">
        <p className="flex items-center gap-2 text-sm font-medium text-navy-700">
          <MapPin className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
          {label}
        </p>

        <a
          href={googleMapsUrl(lat, lng, label)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-navy-900
                     transition-colors hover:text-gold-700"
        >
          {t('openInMaps')}
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
