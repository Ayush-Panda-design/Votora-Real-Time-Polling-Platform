import { useEffect, useRef } from 'react';
import { connectSocket } from '../socket/socket';
import { SOCKET_EVENTS } from '../utils/constants';

/**
 * Subscribe to creator dashboard real-time updates (user room).
 */
export const useUserSocket = (handlers = {}, enabled = true) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;

    const socket = connectSocket();
    socket.emit(SOCKET_EVENTS.JOIN_USER);

    const onStats = (data) => handlersRef.current.onPollStatsUpdate?.(data);
    const onList = (data) => handlersRef.current.onPollListChanged?.(data);

    socket.on(SOCKET_EVENTS.POLL_STATS_UPDATE, onStats);
    socket.on(SOCKET_EVENTS.POLL_LIST_CHANGED, onList);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_USER);
      socket.off(SOCKET_EVENTS.POLL_STATS_UPDATE, onStats);
      socket.off(SOCKET_EVENTS.POLL_LIST_CHANGED, onList);
    };
  }, [enabled]);
};

export default useUserSocket;
