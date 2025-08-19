import { useEffect, useCallback } from 'react';

export function useSocketRoom(socket: any, roomId: string) {
  const joinRoom = useCallback(() => {
    if (socket?.connected) {
      socket.emit('join-room', { roomId });
    }
  }, [socket, roomId]);

  const leaveRoom = useCallback(() => {
    if (socket?.connected) {
      socket.emit('leave-room', { roomId });
    }
  }, [socket, roomId]);

  const sendToRoom = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit('room-message', {
        roomId,
        event,
        data,
      });
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (socket?.connected && roomId) {
      joinRoom();
    }

    return () => {
      if (socket?.connected && roomId) {
        leaveRoom();
      }
    };
  }, [socket, roomId, joinRoom, leaveRoom]);

  return {
    joinRoom,
    leaveRoom,
    sendToRoom,
  };
}
