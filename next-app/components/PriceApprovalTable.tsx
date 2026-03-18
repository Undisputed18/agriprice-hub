export default function PriceApprovalTable() {
  const priceUpdates = [
    { id: 1, product: 'Maize Seeds Hybrid XL', market: 'Nairobi', oldPrice: 2500, newPrice: 2750, submittedBy: 'John Kamau', status: 'pending' },
    { id: 2, product: 'NPK 15-15-15 Plus', market: 'Mombasa', oldPrice: 4500, newPrice: 4800, submittedBy: 'Mary Wanjiru', status: 'pending' },
    { id: 3, product: 'Drip Irrigation Kit', market: 'Kisumu', oldPrice: 12000, newPrice: 11500, submittedBy: 'David Ochieng', status: 'approved' },
    { id: 4, product: 'Wheat Seeds Premium', market: 'Eldoret', oldPrice: 3200, newPrice: 3400, submittedBy: 'Grace Mutiso', status: 'pending' },
    { id: 5, product: 'Organic Fertilizer', market: 'Nakuru', oldPrice: 2800, newPrice: 2900, submittedBy: 'Samuel Kiprop', status: 'rejected' },
  ];

  const handleApproval = (id: number, action: 'approve' | 'reject') => {
    console.log(`${action} price update ${id}`);
  };

  return (
    <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-text-dark dark:text-text-light text-lg font-bold">Price Approval Queue</h3>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-medium">
            3 Pending
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Product</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Market</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Price Change</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Submitted By</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {priceUpdates.map((update) => (
              <tr key={update.id} className="border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark/50 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="text-text-dark dark:text-text-light text-sm font-medium">{update.product}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-text-secondary text-sm">{update.market}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary text-sm line-through">KSh {update.oldPrice}</span>
                    <span className="text-text-dark dark:text-text-light text-sm font-medium">KSh {update.newPrice}</span>
                    <span className={`text-xs font-medium ${
                      update.newPrice > update.oldPrice ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {update.newPrice > update.oldPrice ? '+' : ''}{Math.round(((update.newPrice - update.oldPrice) / update.oldPrice) * 100)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-text-secondary text-sm">{update.submittedBy}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    update.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    update.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {update.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {update.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleApproval(update.id, 'approve')}
                        className="p-1 text-text-secondary hover:text-green-600 transition-colors"
                        title="Approve"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                      <button 
                        onClick={() => handleApproval(update.id, 'reject')}
                        className="p-1 text-text-secondary hover:text-red-600 transition-colors"
                        title="Reject"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-text-secondary text-xs">
                      {update.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
