import React from 'react'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'icon' | 'gradient' | 'black'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  className?: string
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  animation?: 'none' | 'pulse' | 'bounce' | 'glow'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className,
  isLoading = false,
  leftIcon,
  rightIcon,
  animation = 'none',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variantStyles = {
    primary: 'bg-edsu-green text-white hover:bg-edsu-green/90 hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-edsu-pink text-white hover:bg-edsu-pink/90 hover:shadow-lg hover:-translate-y-0.5',
    outline: 'border-2 border-foreground/20 hover:bg-foreground/5 hover:border-foreground/40',
    icon: 'text-foreground/60 hover:text-foreground hover:scale-110',
    gradient: 'bg-gradient-to-r from-edsu-green via-white to-edsu-pink text-black hover:shadow-lg hover:-translate-y-0.5 hover:scale-105',
    black: 'bg-black text-white hover:bg-black/90 hover:shadow-lg hover:-translate-y-0.5'
  }

  const sizeStyles = {
    xs: 'h-7 px-2.5 text-xs rounded',
    sm: 'h-8 px-3 type-america-sm rounded-md',
    md: 'h-10 px-4 type-america-md rounded-lg',
    lg: 'h-12 px-6 type-america-lg rounded-lg',
    xl: 'h-14 px-8 type-america-xl rounded-xl',
    icon: variant === 'icon' ? 'h-10 w-10 rounded-full' : ''
  }

  const animationStyles = {
    none: '',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    glow: 'hover:animate-glow'
  }

  const loadingSpinner = (
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
  )

  const classes = twMerge(
    baseStyles,
    variantStyles[variant],
    sizeStyles[variant === 'icon' ? 'icon' : size],
    animationStyles[animation],
    className
  )

  const content = (
    <>
      {isLoading && loadingSpinner}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      disabled={isLoading}
      {...props}
    >
      {content}
    </button>
  )
} 