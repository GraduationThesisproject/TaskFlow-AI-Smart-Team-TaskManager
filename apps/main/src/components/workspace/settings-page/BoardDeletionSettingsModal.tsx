import React from 'react';
import { Modal, ModalBody, ModalFooter, Button } from '@taskflow/ui';
import type { BoardDeletionSettingsModalProps } from '../../../types/interfaces/ui';

const BoardDeletionSettingsModal: React.FC<BoardDeletionSettingsModalProps> = ({
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
        description="You don't have permission to change board deletion restrictions."
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
                    <p>Only workspace <strong>owners</strong> and <strong>admins</strong> can change board deletion restrictions.</p>
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

  // Selection Modal with policy radios
  const initialPolicy: 'everyone' | 'admins' =
    currentSetting?.toLowerCase().includes('any member') ? 'everyone' : 'admins';
  const [policy, setPolicy] = React.useState<'everyone' | 'admins'>(initialPolicy);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Board Deletion Permissions"
      description="Choose who can delete boards in this workspace. Owners always have permission."
      size="md"
    >
      <ModalBody>
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 text-sm text-orange-700">
                Changes here affect who can permanently delete boards. Deleted boards cannot be recovered.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer">
              <input
                type="radio"
                name="boardDeletionPolicy"
                checked={policy === 'everyone'}
                onChange={() => setPolicy('everyone')}
              />
              <div>
                <div className="font-medium">Everyone</div>
                <div className="text-sm text-muted-foreground">Any workspace member can delete boards.</div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer">
              <input
                type="radio"
                name="boardDeletionPolicy"
                checked={policy === 'admins'}
                onChange={() => setPolicy('admins')}
              />
              <div>
                <div className="font-medium">Only Admins</div>
                <div className="text-sm text-muted-foreground">Only admins can delete boards. Owners always can.</div>
              </div>
            </label>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm && onConfirm(policy)}
          disabled={loading}
          className="ml-2"
          variant={policy === 'everyone' ? 'destructive' : 'default'}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
;

export default BoardDeletionSettingsModal;
