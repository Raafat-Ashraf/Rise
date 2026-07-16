'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Announced as the dialog's accessible name. */
  label: string;
  closeLabel: string;
  /** Renders the panel edge-to-edge (used by the gallery lightbox). */
  variant?: 'panel' | 'full';
  className?: string;
  children: React.ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: portalled to <body>, closes on Escape and backdrop click,
 * traps Tab focus inside the panel, restores focus to the trigger on close, and
 * locks background scroll while open.
 */
export function Modal({
  open,
  onClose,
  label,
  closeLabel,
  variant = 'panel',
  className,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Wrap the cycle at both ends so focus can never escape the dialog.
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;

    // Lock scroll, compensating for the scrollbar so the page doesn't jump.
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingInlineEnd;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingInlineEnd = `${scrollbarWidth}px`;

    document.addEventListener('keydown', handleKeyDown);

    // Move focus into the panel on the next frame, once it has mounted.
    const frame = requestAnimationFrame(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
      target?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(frame);
      body.style.overflow = previousOverflow;
      body.style.paddingInlineEnd = previousPadding;
      returnFocusRef.current?.focus();
    };
  }, [open, handleKeyDown]);

  // createPortal needs a DOM; bail out during SSR.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-navy-950/85 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 outline-none',
              variant === 'panel'
                ? 'max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card border border-sand-300 bg-sand-50 p-6 shadow-lift sm:p-8'
                : 'flex size-full max-h-full items-center justify-center',
              className,
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className={cn(
                'absolute z-20 grid size-11 place-items-center rounded-full transition-colors',
                variant === 'panel'
                  ? 'end-4 top-4 bg-sand-200 text-navy-700 hover:bg-sand-300'
                  : 'end-0 top-0 bg-navy-900/70 text-sand-50 backdrop-blur hover:bg-gold-500 hover:text-navy-950',
              )}
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
