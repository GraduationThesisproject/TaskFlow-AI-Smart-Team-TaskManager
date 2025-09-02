import { useEffect, useCallback } from 'react';

export function useSocketEvent(
  socket: any,
  event: string,
  callback: (data: any) => void
) {
  const handleEvent = useCallback((data: any) => {
    callback(data);
  }, [callback]);

  useEffect(() => {
    if (socket) {
      socket.on(event, handleEvent);

      return () => {
        socket.off(event, handleEvent);
      };
    }
  }, [socket, event, handleEvent]);
}
