'use client';

import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Form primitives.
 *
 * All three forward their ref so react-hook-form's `register()` can bind
 * directly, and all three wire up `aria-invalid` + `aria-describedby` so the
 * error text is announced rather than merely shown in red.
 */

const fieldBase =
  'w-full rounded-xl border bg-sand-50 px-4 text-navy-900 transition-all duration-200 ' +
  'placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-500/40 ' +
  'focus:border-gold-500 disabled:cursor-not-allowed disabled:opacity-60';

interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  hint?: string;
  hintId?: string;
  optionalLabel?: string;
  children: React.ReactNode;
}

function FieldShell({
  label,
  htmlFor,
  error,
  errorId,
  hint,
  hintId,
  optionalLabel,
  children,
}: FieldShellProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-navy-800">
          {label}
        </label>
        {optionalLabel ? (
          <span className="text-xs text-navy-400">{optionalLabel}</span>
        ) : null}
      </div>

      {children}

      {hint && !error ? (
        <p id={hintId} className="mt-2 text-xs text-navy-400">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gold-700"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, optionalLabel, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      error={error}
      errorId={errorId}
      hint={hint}
      hintId={hintId}
      optionalLabel={optionalLabel}
    >
      <input
        ref={ref}
        id={fieldId}
        className={cn(
          fieldBase,
          'h-12',
          error && 'border-gold-700 ring-2 ring-gold-700/20',
          !error && 'border-sand-300',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      />
    </FieldShell>
  );
});

// ── Textarea ───────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, optionalLabel, className, id, rows = 5, ...props },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    return (
      <FieldShell
        label={label}
        htmlFor={fieldId}
        error={error}
        errorId={errorId}
        hint={hint}
        hintId={hintId}
        optionalLabel={optionalLabel}
      >
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={cn(
            fieldBase,
            'resize-y py-3 leading-relaxed',
            error && 'border-gold-700 ring-2 ring-gold-700/20',
            !error && 'border-sand-300',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        />
      </FieldShell>
    );
  },
);

// ── Select ─────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, optionalLabel, placeholder, options, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      error={error}
      errorId={errorId}
      hint={hint}
      hintId={hintId}
      optionalLabel={optionalLabel}
    >
      <select
        ref={ref}
        id={fieldId}
        defaultValue={props.defaultValue ?? ''}
        className={cn(
          fieldBase,
          'h-12 cursor-pointer appearance-none bg-[length:1.25rem] bg-no-repeat pe-11',
          // Chevron drawn as an inline SVG data URI in navy-400, so it needs no
          // extra element and stays inside the palette.
          "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235C6B85' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
          'bg-[position:right_0.9rem_center] rtl:bg-[position:left_0.9rem_center]',
          error && 'border-gold-700 ring-2 ring-gold-700/20',
          !error && 'border-sand-300',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});

// ── Checkbox ───────────────────────────────────────────────────────────────

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          className={cn(
            'mt-0.5 size-5 shrink-0 cursor-pointer rounded border-sand-300 text-gold-500',
            'accent-gold-500 focus:ring-2 focus:ring-gold-500/40',
            error && 'border-gold-700',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        <label
          htmlFor={fieldId}
          className="cursor-pointer text-sm leading-relaxed text-navy-600"
        >
          {label}
        </label>
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gold-700"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
});
