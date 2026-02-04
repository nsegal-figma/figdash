import React from 'react';
import { motion } from 'framer-motion';
import { useChartTheme } from '../hooks/useChartTheme';

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
      whileHover={hover ? { opacity: theme.effects.hoverOpacity } : undefined}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: theme.effects.animationDuration / 1000 }}
    >
      {children}
    </motion.div>
  );
}






