import UsersTable from '@/components/admin/UsersTable'

export default function AdminUsersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-dark dark:text-text-light">User Management</h1>
        <p className="text-text-secondary">Manage farmers, agrodealers and market officers</p>
      </div>
      <UsersTable />
    </div>
  )
}
