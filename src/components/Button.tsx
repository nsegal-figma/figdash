import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  icon,
  loading = false,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] focus:ring-gray-900 border border-gray-900',
    secondary: 'bg-white text-gray-900 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] focus:ring-gray-900',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98] focus:ring-gray-900',
    danger: 'bg-error text-white hover:bg-error-dark active:scale-[0.98] focus:ring-error border border-error'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const spinner = (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {loading ? spinner : icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}





