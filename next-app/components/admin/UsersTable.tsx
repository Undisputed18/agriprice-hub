'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  status?: string
  created_at: string
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        console.log('Admin Users Data:', data);
        
        // If data.users is missing, handle it
        const allUsers = data.users || [];
        
        // More inclusive filtering
        const filteredUsers = allUsers.filter((user: User) => {
          if (!user.role) return true; // Show users with no role for visibility
          const role = user.role.toLowerCase();
          return role.includes('dealer') || 
                 role.includes('officer') || 
                 role.includes('farmer') ||
                 role === 'admin';
        })
        
        setUsers(filteredUsers)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'farmer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'dealer':
      case 'agro-dealer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'officer':
      case 'market officer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const formatRole = (role: string) => {
    switch (role.toLowerCase()) {
      case 'dealer':
      case 'agro-dealer': 
        return 'Agro-Dealer'
      case 'officer':
      case 'market officer': 
        return 'Market Officer'
      case 'farmer':
        return 'Farmer'
      default: return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-text-dark dark:text-text-light text-lg font-bold">User Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-sm">person_add</span>
          <span className="text-sm font-medium">Add User</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Name</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Email</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Role</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Joined</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-secondary text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-text-dark text-sm font-medium">
                        {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : '?'}
                      </div>
                      <span className="text-text-dark dark:text-text-light text-sm font-medium">{user.full_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-sm">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'Active' || !user.status ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button className="p-1 text-text-secondary hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
