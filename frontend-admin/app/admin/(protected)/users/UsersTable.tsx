'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Button from '../../../../../shared/components/ui/Button'
import Text from '../../../../../shared/components/ui/Text'
import { IUser } from '../../../../../backend/src/models/User'
import { Edit, Trash2, Plus } from 'lucide-react'
import UserFormModal from './UserFormModal'

type Organization = 'EDSU' | 'TokoBuku'
type Role = 'admin' | 'editor'

interface UserFormData {
  username: string
  password?: string
  organization: Organization
  role: Role
}

export default function UsersTable() {
  const router = useRouter()
  const { data: session } = useSession()
  const [users, setUsers] = useState<(IUser & { _id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<(IUser & { _id: string }) | null>(null)

  // Fetch users on component mount
  useEffect(() => {
    if (session) {
      fetchUsers()
    }
  }, [session])

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to delete user')
      
      await fetchUsers() // Refresh the list
      router.refresh() // Refresh the page
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Failed to delete user')
    }
  }

  if (!session) return <div>Please log in to view users</div>
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Organization
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Created At
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <Text variant="body">{user.username}</Text>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Text variant="body">{user.organization}</Text>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Text variant="body">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="icon"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowEditModal(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="icon"
                      onClick={() => handleDelete(user._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <UserFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data: UserFormData) => {
            try {
              const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify(data),
              })
              
              if (!response.ok) throw new Error('Failed to create user')
              
              await fetchUsers()
              setShowAddModal(false)
              router.refresh()
            } catch (err) {
              console.error('Error creating user:', err)
              setError('Failed to create user')
            }
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSubmit={async (data: UserFormData) => {
            try {
              const response = await fetch(`/api/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify(data),
              })
              
              if (!response.ok) throw new Error('Failed to update user')
              
              await fetchUsers()
              setShowEditModal(false)
              setSelectedUser(null)
              router.refresh()
            } catch (err) {
              console.error('Error updating user:', err)
              setError('Failed to update user')
            }
          }}
        />
      )}
    </>
  )
} 