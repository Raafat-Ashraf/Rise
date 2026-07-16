import { forwardRef } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'onDark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'whitespace-nowrap transition-all duration-300 ease-rise gpu ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  // Gold gradient lifted from the logo's monogram
  primary:
    'bg-gold-gradient text-navy-950 shadow-gold hover:-translate-y-0.5 ' +
    'hover:shadow-[0_18px_50px_-12px_rgb(188_143_67/0.7)] active:translate-y-0',
  secondary:
    'bg-navy-900 text-sand-50 hover:bg-navy-800 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0',
  outline:
    'border border-navy-900/20 bg-transparent text-navy-900 hover:border-gold-500 ' +
    'hover:bg-gold-500/10 hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'bg-transparent text-navy-900 hover:bg-navy-900/5',
  // For use on the deep-navy sections
  onDark:
    'border border-sand-50/25 bg-sand-50/5 text-sand-50 backdrop-blur-sm hover:border-gold-500 ' +
    'hover:bg-gold-500/15 hover:-translate-y-0.5 active:translate-y-0',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-12 px-7 text-[0.9375rem]',
  lg: 'h-14 px-9 text-base',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

type AnchorProps = BaseProps & {
  /** Internal route — locale prefix is added by next-intl's <Link>. */
  href: string;
  /** Renders a plain <a> for tel:/mailto:/external links. */
  external?: boolean;
} & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    // `popover` is dropped because React 19's DOM types widen it with "hint",
    // which next-intl's <Link> props (still on the narrower union) reject.
    'className' | 'children' | 'href' | 'popover'
  >;

/**
 * A gold sheen that sweeps across the button on hover.
 * `pointer-events-none` keeps it out of the way of clicks.
 */
function Sheen() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
    >
      <span
        className="absolute inset-y-0 -left-full w-1/2 bg-gold-sheen opacity-0 transition-all
                   duration-700 ease-rise group-hover/btn:left-full group-hover/btn:opacity-100"
      />
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], 'overflow-hidden', className)}
      {...props}
    >
      <Sheen />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
});

export const ButtonLink = forwardRef<HTMLAnchorElement, AnchorProps>(function ButtonLink(
  { variant = 'primary', size = 'md', className, children, href, external, ...props },
  ref,
) {
  const classes = cn(base, variants[variant], sizes[size], 'overflow-hidden', className);
  const content = (
    <>
      <Sheen />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (external) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={classes} {...props}>
      {content}
    </Link>
  );
});
