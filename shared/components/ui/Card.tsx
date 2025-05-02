import React from 'react'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  children: React.ReactNode
  className?: string
  href?: string
  variant?: 'default' | 'hover' | 'outline'
  onClick?: () => void
}

export default function Card({
  children,
  className,
  href,
  variant = 'default',
  onClick
}: CardProps) {
  const baseStyles = 'relative bg-white shadow-sm overflow-hidden'
  
  const variantStyles = {
    default: '',
    hover: 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-[#EB008B] hover:text-[#6EBDAF]',
    outline: 'border border-gray-200 shadow-none'
  }

  const content = (
    <div 
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    )
  }

  return content
} 