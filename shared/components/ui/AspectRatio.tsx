import React from 'react'
import { twMerge } from 'tailwind-merge'

interface AspectRatioProps {
  ratio?: number
  className?: string
  children: React.ReactNode
}

export default function AspectRatio({ ratio = 1, className = '', children }: AspectRatioProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  )
} 