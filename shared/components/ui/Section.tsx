import React from 'react'
import { twMerge } from 'tailwind-merge'
import Container from './Container'

interface SectionProps {
  children: React.ReactNode
  id?: string
  className?: string
  background?: 'none' | 'light' | 'dark' | 'gradient'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Section({
  children,
  id,
  className,
  background = 'none',
  spacing = 'lg'
}: SectionProps) {
  const baseStyles = 'relative'
  
  const backgroundStyles = {
    none: '',
    light: 'bg-white',
    dark: 'bg-gray-900 text-white',
    gradient: 'bg-gradient-to-b from-white to-edsu-green/5'
  }

  const spacingStyles = {
    none: '',
    sm: 'py-8',
    md: 'py-16',
    lg: 'py-24'
  }

  return (
    <section
      id={id}
      className={twMerge(
        baseStyles,
        backgroundStyles[background],
        spacingStyles[spacing],
        className
      )}
    >
      {/* Floating Decorations */}
      {background === 'gradient' && (
        <>
          <div className="floating-square bg-[#EB008B]/20" style={{ top: '10%', left: '5%' }} />
          <div className="floating-circle bg-[#6EBDAF]/20" style={{ top: '30%', right: '10%' }} />
          <div className="floating-triangle border-b-[#EB008B]/20" style={{ bottom: '20%', left: '15%' }} />
        </>
      )}

      <Container>
        {children}
      </Container>
    </section>
  )
} 