import React from 'react'
import { twMerge } from 'tailwind-merge'

interface TextProps {
  children: React.ReactNode
  variant?: 'body' | 'lead' | 'caption' | 'glitch' | 'heading'
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black'
  color?: 'default' | 'muted' | 'green' | 'pink'
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export default function Text({
  children,
  variant = 'body',
  size = 'base',
  weight = 'normal',
  color = 'default',
  className,
  as: Component = 'p'
}: TextProps) {
  const baseStyles = 'font-frutiger'
  
  const variantStyles = {
    body: 'type-md',
    lead: 'type-mc-lg',
    caption: 'type-sm',
    glitch: 'heading-black glitch-text',
    heading: 'heading-black'
  }

  const sizeStyles = {
    sm: 'type-sm',
    base: 'type-md',
    lg: 'type-lg',
    xl: 'type-gh-lg',
    '2xl': 'type-gh-xl'
  }

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black'
  }

  const colorStyles = {
    default: 'text-foreground',
    muted: 'text-foreground/60',
    green: 'text-edsu-green',
    pink: 'text-edsu-pink'
  }

  return (
    <Component
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        variant !== 'glitch' && variant !== 'heading' ? sizeStyles[size] : '',
        weightStyles[weight],
        colorStyles[color],
        className
      )}
    >
      {children}
    </Component>
  )
} 