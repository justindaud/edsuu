'use client'

import { useState } from 'react'
import Button from '../../../../../shared/components/ui/Button'
import Text from '../../../../../shared/components/ui/Text'
import { IUser } from '../../../../../backend/src/models/User'

type Organization = 'EDSU' | 'TokoBuku'
type Role = 'admin' | 'editor'

interface UserFormModalProps {
  user?: IUser & { _id: string }
  onClose: () => void
  onSubmit: (data: {
    username: string
    password?: string
    organization: Organization
    role: Role
  }) => Promise<void>
}

export default function UserFormModal({ user, onClose, onSubmit }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    password: '',
    organization: (user?.organization || 'EDSU') as Organization,
    role: (user?.role || 'editor') as Role
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.username || (!user && !formData.password) || !formData.organization || !formData.role) {
        throw new Error('Please fill in all required fields')
      }

      // Only include password in the submission if it's provided (for editing)
      const submitData = {
        ...formData,
        password: formData.password || undefined
      }

      await onSubmit(submitData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <Text variant="heading" className="text-xl">
            {user ? 'Edit User' : 'Add User'}
          </Text>
          <Button variant="icon" onClick={onClose}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-900 dark:bg-red-900 dark:text-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password {user && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              required={!user}
            />
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Organization
            </label>
            <select
              id="organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value as Organization })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              required
            >
              <option value="EDSU">EDSU</option>
              <option value="TokoBuku">TokoBuku</option>
            </select>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              required
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : user ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 