import React from 'react';
import { Modal, ModalBody, ModalFooter, Button } from '@taskflow/ui';

interface BoardCreationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (policy: 'everyone' | 'admins') => void;
  canManage: boolean;
  currentSetting: string;
  newSetting: string;
  userRole: string | null;
  userName?: string;
  loading: boolean;
}

const BoardCreationSettingsModal: React.FC<BoardCreationSettingsModalProps> = ({
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
        description="You don't have permission to change board creation restrictions."
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
                    <p>Only workspace <strong>owners</strong> and <strong>admins</strong> can change board creation restrictions.</p>
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

  // Selection Modal
  const initialPolicy: 'everyone' | 'admins' =
    currentSetting?.toLowerCase().includes('any member') ? 'everyone' : 'admins';
  const [policy, setPolicy] = React.useState<'everyone' | 'admins'>(initialPolicy);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Board Creation Permissions"
      description="Choose who can create boards in this workspace. Owners always have permission."
      size="md"
    >
      <ModalBody>
        <div className="space-y-3">
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-md border cursor-pointer">
              <input
                type="radio"
                name="board-creation-policy"
                className="mt-1"
                checked={policy === 'everyone'}
                onChange={() => setPolicy('everyone')}
              />
              <div>
                <div className="font-medium">Everyone</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Any workspace member can create public, workspace-visible, or private boards.
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-md border cursor-pointer">
              <input
                type="radio"
                name="board-creation-policy"
                className="mt-1"
                checked={policy === 'admins'}
                onChange={() => setPolicy('admins')}
              />
              <div>
                <div className="font-medium">Only Admins</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Only admins and the owner can create boards. Members must request creation.
                </div>
              </div>
            </label>
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
          onClick={() => onConfirm && onConfirm(policy)}
          disabled={loading}
          className="ml-2"
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BoardCreationSettingsModal;
