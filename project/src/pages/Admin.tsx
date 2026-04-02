import React from 'react';

export const Admin: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">Manage Users, Cities, and Alerts here.</p>
      </div>
    </div>
  );
};
