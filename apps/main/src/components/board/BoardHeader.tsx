import React, { useState } from 'react';
import { Typography, Button } from '@taskflow/ui';
import type { Board } from '../../types/board.types';

interface BoardHeaderProps {
  className?: string;
  currentBoard: Board | null;
  loading: boolean;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ 
  className = '', 
  currentBoard, 
  loading 
}) => {
  const [activeSidebar, setActiveSidebar] = useState<'settings' | 'members' | null>(null);
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);

  const handleSidebarToggle = (sidebar: 'settings' | 'members' | null) => {
    if (activeSidebar === sidebar) {
      // Closing sidebar
      setIsSidebarAnimating(true);
      setTimeout(() => {
        setActiveSidebar(null);
        setIsSidebarAnimating(false);
      }, 300);
    } else {
      // Opening sidebar
      setActiveSidebar(sidebar);
      setIsSidebarAnimating(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="px-6 sm:px-8 lg:px-12 py-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100/80">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Board Info */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button 
                onClick={() => window.history.back()}
                className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                title="Back to Space"
              >
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {currentBoard.name?.charAt(0)?.toUpperCase() || 'B'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-base font-semibold text-gray-900 leading-tight">
                    {currentBoard.name || 'Untitled Board'}
                  </h1>
                  <p className="text-xs text-gray-500 leading-tight">
                    {currentBoard.description || 'No description'}
                  </p>
                </div>
                
                {/* Members */}
                <div className="flex items-center gap-1.5">
                  {currentBoard.members && currentBoard.members.length > 0 ? (
                    <>
                      {currentBoard.members.slice(0, 2).map((member: any, index: number) => (
                        <div
                          key={index}
                          className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border border-white"
                          title={member.name || member.email || 'Member'}
                        >
                          {(member.name || member.email || 'M').charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {currentBoard.members.length > 2 && (
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 border border-white">
                          +{currentBoard.members.length - 2}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-400 border border-white">
                      ?
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleSidebarToggle('settings')}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  activeSidebar === 'settings' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
                title="Board Settings"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button 
                onClick={() => handleSidebarToggle('members')}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  activeSidebar === 'members' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
                title="Manage Members"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      {activeSidebar === 'settings' && (
        <div className={`fixed inset-y-0 right-0 w-80 bg-white/95 backdrop-blur-md border-l border-gray-200/50 shadow-xl z-50 transform transition-transform duration-500 ease-out ${
          isSidebarAnimating ? 'translate-x-full' : 'translate-x-0'
        }`}>
          <div className={`h-full flex flex-col transition-all duration-500 ease-out ${
            isSidebarAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
          }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
              <h2 className="text-lg font-semibold text-gray-900">Board Settings</h2>
              <button 
                onClick={() => handleSidebarToggle('settings')}
                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Settings Content */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
              {/* Board Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Board Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Board Name</label>
                    <input 
                      type="text" 
                      defaultValue={currentBoard.name || ''}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent caret-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      defaultValue={currentBoard.description || ''}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none caret-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Board Preferences */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Allow guest access</span>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Enable notifications</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Auto-archive completed tasks</span>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <h3 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h3>
                <button className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors">
                  Delete Board
                </button>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200/50">
              <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Sidebar */}
      {activeSidebar === 'members' && (
        <div className={`fixed inset-y-0 right-0 w-80 bg-white/95 backdrop-blur-md border-l border-gray-200/50 shadow-xl z-50 transform transition-transform duration-500 ease-out ${
          isSidebarAnimating ? 'translate-x-full' : 'translate-x-0'
        }`}>
          <div className={`h-full flex flex-col transition-all duration-500 ease-out ${
            isSidebarAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
          }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
              <h2 className="text-lg font-semibold text-gray-900">Board Members</h2>
              <button 
                onClick={() => handleSidebarToggle('members')}
                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add Member Section */}
            <div className="p-4 border-b border-gray-200/50">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Invite Members</h3>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Invite
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Current Members</h3>
              <div className="space-y-3">
                {currentBoard.members && currentBoard.members.length > 0 ? (
                  currentBoard.members.map((member: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {(member.name || member.email || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {member.role || 'Member'}
                        </span>
                        <button className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No members yet</p>
                    <p className="text-xs text-gray-400">Invite people to collaborate on this board</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {activeSidebar && (
        <div 
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-500 ease-out ${
            isSidebarAnimating ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={() => handleSidebarToggle(activeSidebar)}
        />
      )}
    </div>
  );
};
