import React from 'react'
import { twMerge } from 'tailwind-merge'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export default function Container({
  children,
  size = 'lg',
  className,
  as: Component = 'div'
}: ContainerProps) {
  const baseStyles = 'mx-auto px-4 sm:px-6'
  
  const sizeStyles = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[96rem]',
    full: 'w-full'
  }

  return (
    <Component className={twMerge(
      baseStyles,
      sizeStyles[size],
      className
    )}>
      {children}
    </Component>
  )
} 