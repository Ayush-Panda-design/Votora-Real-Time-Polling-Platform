import api from './api';
import { getSocket } from '../socket/socket';
import { SOCKET_EVENTS } from '../utils/constants';

/** Start a manual live timer via REST (reliable) with socket fallback */
export const startPollTimer = async (pollId) => {
  try {
    const res = await api.post(`/polls/${pollId}/start-timer`);
    return res.data;
  } catch (err) {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.START_TIMER, { pollId });
      return null;
    }
    throw err;
  }
};
