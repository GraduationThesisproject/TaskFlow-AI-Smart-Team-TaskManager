import React from 'react';
import { Button } from '@taskflow/ui';
import { Typography } from '@taskflow/ui';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@taskflow/ui';
import { Monitor, Smartphone, Laptop, LogOut, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { UserSession } from '../../hooks/useSessions';

interface SessionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndAllSessions: () => void;
  sessions: UserSession[];
  isLoading: boolean;
  error: string | null;
  onEndSession: (sessionId: string) => void;
}

export const SessionListModal: React.FC<SessionListModalProps> = ({
  isOpen,
  onClose,
  onEndAllSessions,
  sessions,
  isLoading,
  error,
  onEndSession,
}) => {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'web':
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const currentSession = sessions.find(session => session.isCurrent);
  const otherSessions = sessions.filter(session => !session.isCurrent);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Typography variant="h3" className="text-lg font-semibold">
                Active Sessions
              </Typography>
              <Typography variant="body" className="text-slate-600">
                Manage your active sessions across all devices
              </Typography>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <Typography variant="body" className="text-red-700">
                  {error}
                </Typography>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <Typography variant="body" className="ml-2 text-slate-600">
                  Loading sessions...
                </Typography>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current Session */}
                {currentSession && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(currentSession.deviceInfo.type)}
                        <div>
                          <Typography variant="body-medium" className="font-medium text-green-900">
                            Current Session
                          </Typography>
                          <Typography variant="body" className="text-green-700 text-sm">
                            {currentSession.deviceInfo.os} • {currentSession.deviceInfo.browser}
                          </Typography>
                        </div>
                      </div>
                      <div className="text-right">
                        <Typography variant="body" className="text-green-700 text-sm">
                          {formatDate(currentSession.lastActivityAt)}
                        </Typography>
                        <Typography variant="body" className="text-green-600 text-xs">
                          {currentSession.ipAddress}
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Sessions */}
                {otherSessions.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <Typography variant="body-medium" className="font-medium text-amber-900">
                        Other Active Sessions ({otherSessions.length})
                      </Typography>
                    </div>
                    
                    {otherSessions.map((session) => (
                      <div key={session.deviceId} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(session.deviceInfo.type)}
                            <div>
                              <Typography variant="body-medium" className="font-medium text-slate-900">
                                {session.deviceInfo.type.charAt(0).toUpperCase() + session.deviceInfo.type.slice(1)} Device
                              </Typography>
                              <Typography variant="body" className="text-slate-600 text-sm">
                                {session.deviceInfo.os} • {session.deviceInfo.browser}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-slate-600 text-sm">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(session.lastActivityAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-500 text-xs">
                                <MapPin className="w-3 h-3" />
                                <span>{session.ipAddress}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEndSession(session.deviceId)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <LogOut className="w-3 h-3 mr-1" />
                              End
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Monitor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <Typography variant="body" className="text-slate-500">
                      No other active sessions found
                    </Typography>
                  </div>
                )}
              </div>
            )}
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
            {otherSessions.length > 0 && (
              <Button
                onClick={onEndAllSessions}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                End All Other Sessions
              </Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
