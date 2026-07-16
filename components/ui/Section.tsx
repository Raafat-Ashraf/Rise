import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** `dark` flips the CSS variable theme, so children need no per-tone classes. */
  tone?: 'light' | 'warm' | 'dark';
  /** Renders as <section> by default; pass 'div' when nesting inside one. */
  as?: 'section' | 'div';
  children: React.ReactNode;
}

const tones: Record<NonNullable<SectionProps['tone']>, string> = {
  light: 'bg-sand-50 text-navy-900',
  warm: 'bg-sand-200 text-navy-900',
  dark: 'theme-dark bg-navy-depth text-sand-50',
};

export function Section({
  tone = 'light',
  as: Tag = 'section',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn('relative py-section', tones[tone], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'start' | 'center';
  /** Slot for a "view all" link that sits opposite the heading on desktop. */
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'start',
  action,
  className,
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        centered && 'md:flex-col md:items-center',
        className,
      )}
    >
      <div
        className={cn('max-w-2xl', centered && 'mx-auto text-center')}
        data-animate="header"
      >
        {eyebrow ? (
          <p className="mb-4 flex items-center gap-3 text-label font-semibold uppercase text-gold-600">
            <span
              aria-hidden="true"
              className={cn('h-px w-8 bg-gold-500', centered && 'hidden')}
            />
            {eyebrow}
          </p>
        ) : null}

        <h2 className="text-display-md font-bold">{title}</h2>

        {description ? (
          <p className="mt-5 text-body-lg text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
