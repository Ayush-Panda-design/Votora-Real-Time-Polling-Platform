import { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { reconnectSocket, disconnectSocket, getSocket } from '../socket/socket';
import { useUserSocket } from '../hooks/useUserSocket';
import { updatePollInList, addPollToList, removePollFromList } from '../features/polls/pollSlice';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    if (user) {
      reconnectSocket();
      socketRef.current = getSocket();
    } else if (prevUserIdRef.current) {
      // Logged out — tear down authenticated socket
      disconnectSocket();
      socketRef.current = null;
    }
    prevUserIdRef.current = user?._id ?? null;
  }, [user?._id]);

  useUserSocket({
    onPollStatsUpdate: ({ pollId, ...stats }) => {
      dispatch(updatePollInList({ pollId, ...stats }));
    },
    onPollListChanged: ({ action, poll }) => {
      if (action === 'created') dispatch(addPollToList(poll));
      else if (action === 'deleted') dispatch(removePollFromList(poll._id));
      else if (action === 'updated') dispatch(updatePollInList({ pollId: poll._id, ...poll }));
    },
  }, Boolean(user));

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, getSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);
