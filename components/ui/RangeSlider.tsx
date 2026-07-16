'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  /** Renders each handle's current value (e.g. as a currency string). */
  format: (value: number) => string;
  minLabel: string;
  maxLabel: string;
  className?: string;
}

/**
 * Dual-handle range slider.
 *
 * Built from two stacked native `<input type="range">` elements rather than
 * div-and-pointer-events. That buys real keyboard support (arrows, Home/End),
 * correct screen-reader announcements and touch behaviour for free — all of
 * which a hand-rolled slider has to reimplement and usually gets wrong.
 *
 * The trick is that the track is `pointer-events-none` and only the thumbs
 * accept pointer input, so the two overlapping inputs don't block each other.
 */
export function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
  minLabel,
  maxLabel,
  className,
}: RangeSliderProps) {
  const id = useId();
  const [low, high] = value;

  const range = Math.max(max - min, 1);
  const lowPercent = ((low - min) / range) * 100;
  const highPercent = ((high - min) / range) * 100;

  // Handles must never cross; each clamps against the other.
  const handleLow = (next: number) => onChange([Math.min(next, high - step), high]);
  const handleHigh = (next: number) => onChange([low, Math.max(next, low + step)]);

  const thumb =
    'pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent ' +
    // WebKit thumb
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 ' +
    '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-500 ' +
    '[&::-webkit-slider-thumb]:bg-sand-50 [&::-webkit-slider-thumb]:shadow-card ' +
    '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:cursor-grab ' +
    'hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:cursor-grabbing ' +
    // Firefox thumb
    '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 ' +
    '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full ' +
    '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold-500 ' +
    '[&::-moz-range-thumb]:bg-sand-50 [&::-moz-range-thumb]:cursor-grab ' +
    'focus-visible:outline-none focus-visible:[&::-webkit-slider-thumb]:ring-2 ' +
    'focus-visible:[&::-webkit-slider-thumb]:ring-gold-500 focus-visible:[&::-webkit-slider-thumb]:ring-offset-2';

  return (
    <div className={cn('w-full', className)}>
      <p className="mb-3 text-sm font-semibold text-navy-800">{label}</p>

      <div className="relative h-5">
        {/* Track */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2
                     rounded-full bg-sand-300"
        />
        {/* Selected span. Uses logical inset so it fills from the correct
            side under RTL without a second code path. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full
                     bg-gold-gradient"
          style={{
            insetInlineStart: `${lowPercent}%`,
            width: `${Math.max(highPercent - lowPercent, 0)}%`,
          }}
        />

        <input
          type="range"
          id={`${id}-min`}
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(event) => handleLow(Number(event.target.value))}
          aria-label={`${label} — ${minLabel}`}
          aria-valuetext={format(low)}
          className={cn(thumb, 'z-20')}
        />
        <input
          type="range"
          id={`${id}-max`}
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(event) => handleHigh(Number(event.target.value))}
          aria-label={`${label} — ${maxLabel}`}
          aria-valuetext={format(high)}
          className={cn(thumb, 'z-10')}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs font-medium text-navy-500">
        <span className="numeric rounded-md bg-sand-200 px-2 py-1">{format(low)}</span>
        <span className="numeric rounded-md bg-sand-200 px-2 py-1">{format(high)}</span>
      </div>
    </div>
  );
}
