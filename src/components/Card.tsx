import React from 'react';
import { motion } from 'framer-motion';

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
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:shadow-lg cursor-pointer' : '';
  const clickable = onClick ? 'cursor-pointer' : '';

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md transition-all duration-150 ${paddingStyles[padding]} ${hoverStyles} ${clickable} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}




