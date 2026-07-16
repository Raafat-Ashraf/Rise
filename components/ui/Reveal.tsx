'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

/**
 * Scroll reveal primitives.
 *
 * Only `transform` and `opacity` are animated — both composited on the GPU, so
 * a page full of these still lands on 60fps. Under `prefers-reduced-motion`
 * every variant collapses to "already visible" rather than being disabled
 * halfway, which would leave content stuck at opacity 0.
 */

const DISTANCE = 24;

type Direction = 'up' | 'down' | 'start' | 'end' | 'none';

function offsetFor(direction: Direction) {
  switch (direction) {
    case 'up':
      return { y: DISTANCE, x: 0 };
    case 'down':
      return { y: -DISTANCE, x: 0 };
    // `start`/`end` are logical: they resolve against the document direction,
    // so an RTL page reveals from the correct side without extra props.
    case 'start':
      return { y: 0, x: DISTANCE };
    case 'end':
      return { y: 0, x: -DISTANCE };
    default:
      return { y: 0, x: 0 };
  }
}

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
  /** Replay each time it scrolls into view (default: animate once). */
  repeat?: boolean;
}

export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className,
  as = 'div',
  repeat = false,
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  const offset = offsetFor(direction);

  if (prefersReduced) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: !repeat, margin: '0px 0px -12% 0px' }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

// ── Stagger ────────────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: DISTANCE },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
  as?: ElementType;
}

/**
 * Wrap a grid or list; each direct <StaggerItem> child enters in sequence.
 * Used for the property card grids.
 */
export function Stagger({
  children,
  className,
  stagger = 0.09,
  as = 'div',
}: StaggerProps) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (prefersReduced) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      custom={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (prefersReduced) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag className={className} variants={itemVariants}>
      {children}
    </MotionTag>
  );
}
