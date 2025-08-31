import React from 'react';
import { Modal, ModalBody, ModalFooter, Button } from '@taskflow/ui';
import type { GuestSharingSettingsModalProps } from '../../../types/interfaces/ui';

const GuestSharingSettingsModal: React.FC<GuestSharingSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  canManage,
  currentSetting,
  newSetting,
  userRole,
  userName,
  loading
}) => {
  if (!canManage) {
    // Permission Denied Modal
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Permission Denied"
        description="You don't have permission to change guest sharing settings."
        size="md"
      >
        <ModalBody>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Insufficient Permissions
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Only workspace <strong>owners</strong> and <strong>admins</strong> can change guest sharing settings.</p>
                    <p className="mt-1">Your current role: <strong>{userRole || 'member'}</strong></p>
                    {userName && (
                      <p className="mt-1">Signed in as: <strong>{userName}</strong></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>
            Understood
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  // Confirmation Modal
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Guest Sharing Settings"
      description={`Are you sure you want to change guest sharing from "${currentSetting}" to "${newSetting}"?`}
      size="md"
    >
      <ModalBody>
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">
                  {newSetting === 'Anyone can invite guests' ? 'Allowing guest invitations' : 'Restricting guest invitations'}
                </h3>
                <div className="mt-2 text-sm text-purple-700">
                  {newSetting === 'Anyone can invite guests' ? (
                    <div>
                      <p>Any workspace member will be able to:</p>
                      <ul className="mt-1 ml-4 list-disc">
                        <li>Send board invitations to external guests</li>
                        <li>Receive and accept board invitations from guests</li>
                        <li>Share boards with people outside the workspace</li>
                      </ul>
                      <p className="mt-2">Guests will have limited access based on board permissions.</p>
                    </div>
                  ) : (
                    <div>
                      <p>Only workspace admins and owners will be able to:</p>
                      <ul className="mt-1 ml-4 list-disc">
                        <li>Send board invitations to external guests</li>
                        <li>Accept board invitations from guests</li>
                        <li>Manage guest access to workspace boards</li>
                      </ul>
                      <p className="mt-2">This provides better control over external access to your workspace.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="ml-2"
        >
          {loading ? 'Changing...' : `Change to "${newSetting}"`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default GuestSharingSettingsModal;
