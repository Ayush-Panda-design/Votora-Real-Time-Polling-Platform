import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '../socket/socket';
import { SOCKET_EVENTS } from '../utils/constants';

/**
 * Subscribe to real-time events for a specific poll room.
 * handlers: { onAnalyticsUpdate, onNewResponse, onParticipantCount, onPollExpired, onPollPublished, onPollStatsUpdate, onTimerStarted }
 */
export const usePollSocket = (pollId, handlers = {}, { enabled = true, analytics = false } = {}) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!pollId || !enabled) return;

    const socket = connectSocket();
    socket.emit(SOCKET_EVENTS.JOIN_POLL, pollId);
    if (analytics) socket.emit(SOCKET_EVENTS.SUBSCRIBE_ANALYTICS, pollId);

    const listen = (event, key) => {
      const fn = (...args) => handlersRef.current[key]?.(...args);
      socket.on(event, fn);
      return () => socket.off(event, fn);
    };

    const offs = [
      listen(SOCKET_EVENTS.ANALYTICS_UPDATE, 'onAnalyticsUpdate'),
      listen(SOCKET_EVENTS.NEW_RESPONSE, 'onNewResponse'),
      listen(SOCKET_EVENTS.PARTICIPANT_COUNT, 'onParticipantCount'),
      listen(SOCKET_EVENTS.POLL_EXPIRED, 'onPollExpired'),
      listen(SOCKET_EVENTS.POLL_PUBLISHED, 'onPollPublished'),
      listen(SOCKET_EVENTS.POLL_STATS_UPDATE, 'onPollStatsUpdate'),
      listen(SOCKET_EVENTS.TIMER_STARTED, 'onTimerStarted'),
    ];

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_POLL, pollId);
      if (analytics) socket.emit(SOCKET_EVENTS.UNSUBSCRIBE_ANALYTICS, pollId);
      offs.forEach((off) => off());
    };
  }, [pollId, enabled, analytics]);
};

export const emitStartTimer = (pollId) => {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.START_TIMER, { pollId });
  }
};

export default usePollSocket;
