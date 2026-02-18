import React from 'react';
import { motion } from 'framer-motion';
import { useChartTheme } from '../hooks/useChartTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  const { theme, styles } = useChartTheme();
  const prefersReducedMotion = useReducedMotion();

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'cursor-pointer' : '';
  const clickable = onClick ? 'cursor-pointer' : '';

  return (
    <motion.div
      className={`border ${paddingStyles[padding]} ${hoverStyles} ${clickable} ${className}`}
      style={{
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.borderColor,
        borderRadius: styles.containerBorderRadius,
        boxShadow: styles.containerShadow,
        transition: styles.animationTransition,
      }}
      onClick={onClick}
      whileHover={hover && !prefersReducedMotion ? { y: -2, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' } : undefined}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : theme.effects.animationDuration / 1000 }}
    >
      {children}
    </motion.div>
  );
}
