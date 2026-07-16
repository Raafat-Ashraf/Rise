'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

interface MagneticProps {
  children: ReactNode;
  /** How far the element may drift toward the cursor, in px. */
  strength?: number;
  className?: string;
}

/**
 * Makes its child drift toward the cursor while hovered, then spring back.
 *
 * Pointer tracking is skipped entirely on coarse pointers (touch) and when the
 * visitor prefers reduced motion — in both cases this renders as a plain
 * wrapper with no listeners attached.
 */
export function Magnetic({ children, strength = 14, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 260, damping: 18, mass: 0.4 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    // Only fine pointers get the effect; a finger has no hover to follow.
    if (prefersReduced || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    // Normalise against half the box so `strength` is the max travel.
    x.set((offsetX / (rect.width / 2)) * strength);
    y.set((offsetY / (rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      // A drag or a lost pointer should also release the magnet.
      onPointerCancel={reset}
    >
      {children}
    </motion.div>
  );
}
