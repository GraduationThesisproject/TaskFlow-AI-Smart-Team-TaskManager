import React, { useState } from 'react';
import { WorkspacesSection } from '../../components/dashboard/home/WorkspacesSection';
import { Button } from '@taskflow/ui';

type ViewMode = 'cards' | 'list' | 'list-detail';

const Workspaces: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                viewMode === 'cards' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cards
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </Button>
            <Button
              variant={viewMode === 'list-detail' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list-detail')}
              className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                viewMode === 'list-detail' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Detail
            </Button>
          </div>
        </div>
      </div>

      <WorkspacesSection viewMode={viewMode} />
    </div>
  );
};

export default Workspaces;
