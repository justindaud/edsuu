import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import Container from '../../../../../shared/components/ui/Container'
import Text from '../../../../../shared/components/ui/Text'
import UsersTable from './UsersTable'

export const metadata: Metadata = {
  title: 'Users Management | Admin Dashboard',
  description: 'Manage users in the admin dashboard',
}

export default async function UsersPage() {
  const session = await getServerSession()

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Text variant="heading" className="text-2xl">
            Users Management
          </Text>
        </div>
        <UsersTable />
      </div>
    </Container>
  )
} 