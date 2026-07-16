import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds the hover lift + gold border treatment. */
  interactive?: boolean;
  tone?: 'light' | 'dark';
  children: React.ReactNode;
}

export function Card({
  interactive = false,
  tone = 'light',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border transition-all duration-500 ease-rise gpu',
        tone === 'light'
          ? 'border-sand-300 bg-sand-50 shadow-card'
          : 'border-navy-600/60 bg-navy-800/60 shadow-lift backdrop-blur-sm',
        interactive &&
          'hover:-translate-y-2 hover:border-gold-500/60 hover:shadow-lift',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 sm:p-7', className)} {...props}>
      {children}
    </div>
  );
}

/** Small pill used for status, type and "featured" markers. */
export function Badge({
  tone = 'gold',
  className,
  children,
}: {
  tone?: 'gold' | 'navy' | 'muted' | 'outline';
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    gold: 'bg-gold-gradient text-navy-950 shadow-[0_4px_14px_-4px_rgb(188_143_67/0.7)]',
    navy: 'bg-navy-900/90 text-sand-50 backdrop-blur-sm',
    muted: 'bg-sand-200 text-navy-700',
    outline: 'border border-current bg-transparent',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
