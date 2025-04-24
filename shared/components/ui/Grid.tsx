import React from 'react'
import { twMerge } from 'tailwind-merge'

interface GridProps {
  children: React.ReactNode
  cols?: number | { base?: number; md?: number; lg?: number }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Grid({
  children,
  cols = 3,
  gap = 'md',
  className
}: GridProps) {
  const baseStyles = 'grid'
  
  const getColClass = (columns: number) => {
    switch (columns) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-2'
      case 3: return 'grid-cols-3'
      case 4: return 'grid-cols-4'
      case 6: return 'grid-cols-6'
      default: return 'grid-cols-1'
    }
  }

  const getResponsiveColClasses = () => {
    if (typeof cols === 'number') {
      return getColClass(cols)
    }

    const { base = 1, md, lg } = cols
    return twMerge(
      getColClass(base),
      md && `md:${getColClass(md)}`,
      lg && `lg:${getColClass(lg)}`
    )
  }

  const gapStyles = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  return (
    <div className={twMerge(
      baseStyles,
      getResponsiveColClasses(),
      gapStyles[gap],
      className
    )}>
      {children}
    </div>
  )
} 