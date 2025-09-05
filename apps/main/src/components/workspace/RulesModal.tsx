import React, { useState, useEffect } from 'react';
import { Modal, ModalContent } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import { useWorkspaceRules } from '../../hooks/useWorkspaceRules';
import { useToast } from '../../hooks/useToast';
import { createPDFFile } from '../../utils/pdfGenerator';
import type { Workspace } from '../../types/workspace.types';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  currentUserRole?: string;
}

const RulesModal: React.FC<RulesModalProps> = ({ 
  isOpen, 
  onClose, 
  workspace, 
  currentUserRole 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { success, error: showError } = useToast();

  const { 
    rules, 
    loading, 
    error, 
    loadWorkspaceRules, 
    uploadRules,
    deleteRules 
  } = useWorkspaceRules({
    autoFetch: false, // Disable auto-fetch to prevent infinite loop
    workspaceId: workspace._id
  });

  // Use rules from current workspace as fallback
  const displayRules = rules || workspace.rules;

  // Check if user can edit rules (admin or owner)
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'owner';
  const canDelete = currentUserRole === 'owner';

  // Load rules when modal opens
  useEffect(() => {
    if (isOpen && workspace._id && !loading && !rules && !workspace.rules) {
      console.log('RulesModal: Loading rules for workspace:', workspace._id);
      loadWorkspaceRules();
    }
  }, [isOpen, workspace._id, loadWorkspaceRules, loading, rules, workspace.rules]);

  // Set edit content when rules are loaded
  useEffect(() => {
    console.log('RulesModal rules data:', {
      rules,
      workspaceRules: workspace.rules,
      displayRules,
      hasContent: !!displayRules?.content,
      contentLength: displayRules?.content?.length || 0,
      hasFileReference: !!displayRules?.fileReference,
      lastUpdatedBy: displayRules?.lastUpdatedBy
    });
    
    if (displayRules?.content) {
      setEditContent(displayRules.content);
    }
  }, [rules, workspace.rules, displayRules]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(displayRules?.content || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(displayRules?.content || '');
  };

  const handleSave = async () => {
    if (!editContent.trim()) return;
    
    setIsSaving(true);
    try {
      // Generate PDF from the content
      const pdfFile = createPDFFile(editContent.trim(), workspace.name);
      
      // Upload the PDF file
      await uploadRules(pdfFile);
      setIsEditing(false);
      success('Workspace rules updated successfully as PDF!');
    } catch (error) {
      console.error('Failed to save rules:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save workspace rules';
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }
    
    try {
      await deleteRules();
      setIsEditing(false);
      setShowDeleteConfirm(false);
      success('Workspace rules reset to default successfully!');
    } catch (error) {
      console.error('Failed to delete rules:', error);
      showError('Failed to reset workspace rules');
    }
  };

  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Convert markdown-like formatting to HTML with better styling
    return content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Lists
      .replace(/^- (.*$)/gim, '<li class="text-gray-700 mb-1">$1</li>')
      .replace(/(<li.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1 my-4">$1</ul>')
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph tags
      .replace(/^(?!<[h|u|l])/gm, '<p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/(?<!>)$/gm, '</p>')
      // Clean up empty paragraphs
      .replace(/<p class="text-gray-700 leading-relaxed mb-4"><\/p>/g, '')
      .replace(/<p class="text-gray-700 leading-relaxed mb-4"><br><\/p>/g, '');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Workspace Rules"
      description={`Guidelines and rules for ${workspace.name}`}
    >
      <ModalContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading rules...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-destructive mb-4">Failed to load rules</div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => loadWorkspaceRules()} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Content */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rules Content
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none font-mono text-sm"
                    placeholder="Enter workspace rules..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports basic formatting: **bold**, *italic*, `code`, and line breaks
                  </p>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    onClick={handleCancelEdit} 
                    variant="outline" 
                    size="sm"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    variant="default" 
                    size="sm"
                    disabled={!editContent.trim() || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {displayRules?.content ? (
                  <>
                    {/* Content Display */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Rules Content
                          </h3>
                          
                          <div className="flex items-center gap-2">
                            {/* Download button */}
                            {displayRules.fileReference && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `/uploads/rules/${displayRules.fileReference?.filename}`;
                                  link.download = displayRules.fileReference?.originalName || 'workspace-rules.pdf';
                                  link.click();
                                }}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                              </Button>
                            )}
                            
                            {/* Edit and Reset buttons */}
                            {canEdit && (
                              <>
                                <Button onClick={handleEdit} variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Button>
                                {canDelete && (
                                  <Button onClick={() => setShowDeleteConfirm(true)} variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Reset
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div 
                          className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-gray-800 prose-ul:text-gray-700 prose-li:text-gray-700"
                          dangerouslySetInnerHTML={{ 
                            __html: displayRules.formattedContent || formatContent(displayRules.content)
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Set</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      This workspace doesn't have any rules defined yet. Create some guidelines to help your team work better together.
                    </p>
                    {canEdit && (
                      <Button onClick={handleEdit} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Rules
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ModalContent>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reset Workspace Rules</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to reset the workspace rules to default? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                onClick={() => setShowDeleteConfirm(false)} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete} 
                variant="destructive" 
                size="sm"
              >
                Reset Rules
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RulesModal;
