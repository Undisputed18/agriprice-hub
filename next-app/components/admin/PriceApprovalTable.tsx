'use client';

import { useState } from 'react';

interface PriceSubmission {
  id: number;
  product: string;
  market: string;
  oldPrice: number;
  newPrice: number;
  submittedBy: string;
  submitterType: 'market_officer' | 'agro_dealer';
  status: 'pending' | 'approved' | 'rejected';
}

export default function PriceApprovalTable() {
  const [submissions, setSubmissions] = useState<PriceSubmission[]>([
    { id: 1, product: 'Maize Seeds Hybrid XL', market: 'Nairobi', oldPrice: 2500, newPrice: 2750, submittedBy: 'John Kamau', submitterType: 'market_officer', status: 'pending' },
    { id: 2, product: 'NPK 15-15-15 Plus', market: 'Mombasa', oldPrice: 4500, newPrice: 4800, submittedBy: 'Mary Wanjiru', submitterType: 'agro_dealer', status: 'pending' },
    { id: 3, product: 'Drip Irrigation Kit', market: 'Kisumu', oldPrice: 12000, newPrice: 11500, submittedBy: 'David Ochieng', submitterType: 'market_officer', status: 'approved' },
    { id: 4, product: 'Wheat Seeds Premium', market: 'Eldoret', oldPrice: 3200, newPrice: 3400, submittedBy: 'Grace Mutiso', submitterType: 'agro_dealer', status: 'pending' },
    { id: 5, product: 'Organic Fertilizer', market: 'Nakuru', oldPrice: 2800, newPrice: 2900, submittedBy: 'Samuel Kiprop', submitterType: 'market_officer', status: 'rejected' },
  ]);

  const handleApproval = (id: number, action: 'approve' | 'reject') => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: action === 'approve' ? 'approved' : 'rejected' } : sub
    ));
    console.log(`${action} price update ${id}`);
  };

  const marketOfficerPending = submissions.filter(s => s.submitterType === 'market_officer' && s.status === 'pending');
  const agroDealerPending = submissions.filter(s => s.submitterType === 'agro_dealer' && s.status === 'pending');

  const PriceTable = ({ title, data, source }: { title: string; data: PriceSubmission[]; source: string }) => (
    <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-text-dark dark:text-text-light text-lg font-bold">{title}</h3>
          <p className="text-text-secondary text-xs mt-1">From {source}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-medium">
            {data.length} Pending
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm">No pending submissions</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Product</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Market</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Price Change</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Submitted By</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((submission) => (
                <tr key={submission.id} className="border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-text-dark dark:text-text-light text-sm font-medium">{submission.product}</p>
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-sm">{submission.market}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary text-sm line-through">KSh {submission.oldPrice}</span>
                      <span className="text-text-dark dark:text-text-light text-sm font-medium">KSh {submission.newPrice}</span>
                      <span className={`text-xs font-medium ${
                        submission.newPrice > submission.oldPrice ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {submission.newPrice > submission.oldPrice ? '+' : ''}{Math.round(((submission.newPrice - submission.oldPrice) / submission.oldPrice) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-sm">{submission.submittedBy}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleApproval(submission.id, 'approve')}
                        className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
                        title="Verify/Approve"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Verify
                      </button>
                      <button 
                        onClick={() => handleApproval(submission.id, 'reject')}
                        className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                        title="Reject"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PriceTable 
        title="Market Officer Price Submissions" 
        data={marketOfficerPending}
        source="Market Officers"
      />
      <PriceTable 
        title="Agro-Dealer Price Submissions" 
        data={agroDealerPending}
        source="Agro-Dealers"
      />
    </div>
  );
}
