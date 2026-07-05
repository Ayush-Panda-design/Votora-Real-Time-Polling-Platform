import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import notify from '../../../utils/notify';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified!');
        notify.success('Email verified — you can sign in now.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="premium-glass-strong p-7 sm:p-9 flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-votora-muted text-sm">Verifying your email…</p>
      </div>
    );
  }

  return (
    <div className="premium-glass-strong p-7 sm:p-9 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">
        {status === 'success' ? 'Email verified' : 'Verification failed'}
      </h1>
      <p className="text-votora-muted text-sm mb-6">{message}</p>
      <Link to="/login">
        <Button>Go to sign in</Button>
      </Link>
    </div>
  );
};

export default VerifyEmailPage;
