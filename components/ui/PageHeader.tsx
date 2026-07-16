import Image from 'next/image';

import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Background photograph, sunk into the navy behind the copy. */
  image?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Shared hero band for the interior pages (Properties, About, Services,
 * Contact). Sits under the fixed header, so it carries the header offset.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  image = '/images/properties/hero-city.jpg',
  className,
  children,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        'theme-dark relative isolate overflow-hidden bg-navy-depth pb-16 pt-[calc(var(--header-height)+4rem)]',
        'lg:pb-20 lg:pt-[calc(var(--header-height)+6rem)]',
        className,
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover opacity-20"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy-depth/80" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-navy-950 to-transparent"
      />

      <div className="shell">
        <Reveal className="max-w-3xl">
          <p className="flex items-center gap-3 text-label font-semibold uppercase text-gold-400">
            <span aria-hidden="true" className="h-px w-10 bg-gold-500" />
            {eyebrow}
          </p>

          <h1 className="mt-5 text-display-lg font-extrabold text-sand-50">{title}</h1>

          {description ? (
            <p className="mt-6 max-w-2xl text-body-lg text-navy-200">{description}</p>
          ) : null}

          {children}
        </Reveal>
      </div>
    </section>
  );
}
