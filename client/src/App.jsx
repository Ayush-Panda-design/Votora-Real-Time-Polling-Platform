import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useDispatch } from 'react-redux';
import { fetchMe } from './features/auth/authSlice';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return <AppRoutes />;
};

export default App;
