import React, { useState } from 'react';
import { Button } from '@taskflow/ui';
import { Typography } from '@taskflow/ui';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@taskflow/ui';
import { LogOut, AlertTriangle, Monitor } from 'lucide-react';
import { SessionListModal } from './SessionListModal';
import { useSessions } from '../../hooks/useSessions';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (allDevices?: boolean) => void;
  userName?: string;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName = 'User'
}) => {
  const [showSessionList, setShowSessionList] = useState(false);
  const { sessions, isLoading, error, endSession, endAllSessions } = useSessions();

  const handleConfirm = (allDevices: boolean = false) => {
    if (allDevices) {
      setShowSessionList(true);
    } else {
      onConfirm(false);
      onClose();
    }
  };

  const handleEndAllSessions = async () => {
    await endAllSessions();
    onConfirm(true);
    onClose();
  };

  const handleEndSession = async (sessionId: string) => {
    await endSession(sessionId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <Typography variant="h3" className="text-lg font-semibold">
                Confirm Logout
              </Typography>
              <Typography variant="body" className="text-slate-600">
                Are you sure you want to log out?
              </Typography>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <Typography variant="body-medium" className="font-medium text-blue-900 mb-1">
                  Logout Options
                </Typography>
                <Typography variant="body" className="text-blue-800 text-sm">
                  You can log out from this device only, or from all devices where you're signed in.
                </Typography>
              </div>
            </div>
            
            <div className="space-y-3">
              <Typography variant="body" className="text-slate-700">
                <strong>{userName}</strong>, please choose your logout preference:
              </Typography>
              
              {sessions.length > 1 && (
                <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Monitor className="w-4 h-4 text-amber-600" />
                  <Typography variant="body" className="text-amber-800 text-sm">
                    You have <strong>{sessions.length - 1} other active session{sessions.length - 1 !== 1 ? 's' : ''}</strong> on different devices
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConfirm(false)}
              className="flex-1"
            >
              This Device Only
            </Button>
            <Button
              onClick={() => handleConfirm(true)}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              All Devices
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
      
      {/* Session List Modal */}
      <SessionListModal
        isOpen={showSessionList}
        onClose={() => setShowSessionList(false)}
        onEndAllSessions={handleEndAllSessions}
        sessions={sessions}
        isLoading={isLoading}
        error={error}
        onEndSession={handleEndSession}
      />
    </Modal>
  );
};
