'use client'

import { useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Artworks', href: '/admin/artworks' },
  { name: 'Programs', href: '/admin/programs' },
  { name: 'Articles', href: '/admin/articles' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Visitors', href: '/admin/visitors' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 