import { useEffect, useRef } from 'react';
import { connectSocket } from '../socket/socket';
import { SOCKET_EVENTS } from '../utils/constants';

const normalizePollId = (pollId) => (pollId ? String(pollId) : null);

/**
 * Subscribe to real-time events for a specific poll room.
 * handlers: { onAnalyticsUpdate, onNewResponse, onParticipantCount, onPollExpired, onPollPublished, onPollStatsUpdate, onTimerStarted }
 */
export const usePollSocket = (pollId, handlers = {}, { enabled = true, analytics = false } = {}) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const roomId = normalizePollId(pollId);

  useEffect(() => {
    if (!roomId || !enabled) return;

    const socket = connectSocket();

    const joinRooms = () => {
      socket.emit(SOCKET_EVENTS.JOIN_POLL, roomId);
      if (analytics) socket.emit(SOCKET_EVENTS.SUBSCRIBE_ANALYTICS, roomId);
    };

    const leaveRooms = () => {
      socket.emit(SOCKET_EVENTS.LEAVE_POLL, roomId);
      if (analytics) socket.emit(SOCKET_EVENTS.UNSUBSCRIBE_ANALYTICS, roomId);
    };

    const listen = (event, key) => {
      const fn = (...args) => handlersRef.current[key]?.(...args);
      socket.on(event, fn);
      return () => socket.off(event, fn);
    };

    // Register listeners before joining so no events are missed
    const offs = [
      listen(SOCKET_EVENTS.ANALYTICS_UPDATE, 'onAnalyticsUpdate'),
      listen(SOCKET_EVENTS.NEW_RESPONSE, 'onNewResponse'),
      listen(SOCKET_EVENTS.PARTICIPANT_COUNT, 'onParticipantCount'),
      listen(SOCKET_EVENTS.POLL_EXPIRED, 'onPollExpired'),
      listen(SOCKET_EVENTS.POLL_PUBLISHED, 'onPollPublished'),
      listen(SOCKET_EVENTS.POLL_STATS_UPDATE, 'onPollStatsUpdate'),
      listen(SOCKET_EVENTS.TIMER_STARTED, 'onTimerStarted'),
    ];

    const onConnect = () => joinRooms();

    socket.on('connect', onConnect);
    if (socket.connected) {
      joinRooms();
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      leaveRooms();
      offs.forEach((off) => off());
    };
  }, [roomId, enabled, analytics]);
};

export default usePollSocket;
