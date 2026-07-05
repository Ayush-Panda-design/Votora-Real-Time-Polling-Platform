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

    const joinUserRoom = () => socket.emit(SOCKET_EVENTS.JOIN_USER);
    const leaveUserRoom = () => socket.emit(SOCKET_EVENTS.LEAVE_USER);

    const onStats = (data) => handlersRef.current.onPollStatsUpdate?.(data);
    const onList = (data) => handlersRef.current.onPollListChanged?.(data);

    socket.on(SOCKET_EVENTS.POLL_STATS_UPDATE, onStats);
    socket.on(SOCKET_EVENTS.POLL_LIST_CHANGED, onList);

    const onConnect = () => joinUserRoom();
    if (socket.connected) joinUserRoom();
    socket.on('connect', onConnect);

    return () => {
      socket.off('connect', onConnect);
      leaveUserRoom();
      socket.off(SOCKET_EVENTS.POLL_STATS_UPDATE, onStats);
      socket.off(SOCKET_EVENTS.POLL_LIST_CHANGED, onList);
    };
  }, [enabled]);
};

export default useUserSocket;
