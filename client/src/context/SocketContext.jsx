import { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { connectSocket, getSocket } from '../socket/socket';
import { useUserSocket } from '../hooks/useUserSocket';
import { updatePollInList, addPollToList, removePollFromList } from '../features/polls/pollSlice';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      socketRef.current = connectSocket();
    }
  }, [user]);

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

export const useSocket = () => useContext(SocketContext);
