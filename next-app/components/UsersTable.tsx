export default function UsersTable() {
  const users = [
    { id: 1, name: 'John Kamau', email: 'john@example.com', role: 'Farmer', status: 'Active', joined: '2024-01-15' },
    { id: 2, name: 'Mary Wanjiru', email: 'mary@example.com', role: 'Agro-Dealer', status: 'Active', joined: '2024-01-20' },
    { id: 3, name: 'David Ochieng', email: 'david@example.com', role: 'Market Officer', status: 'Pending', joined: '2024-02-01' },
    { id: 4, name: 'Grace Mutiso', email: 'grace@example.com', role: 'Farmer', status: 'Active', joined: '2024-02-10' },
    { id: 5, name: 'Samuel Kiprop', email: 'samuel@example.com', role: 'Agro-Dealer', status: 'Suspended', joined: '2024-02-15' },
  ];

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
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-text-dark text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-text-dark dark:text-text-light text-sm font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-text-secondary text-sm">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'Farmer' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    user.role === 'Agro-Dealer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-secondary text-sm">{user.joined}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
