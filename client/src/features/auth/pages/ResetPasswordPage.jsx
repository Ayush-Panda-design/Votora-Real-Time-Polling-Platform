import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import Input, { PasswordInput } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import notify from '../../../utils/notify';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      notify.error('Missing reset token');
      return;
    }
    if (password !== confirm) {
      notify.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      notify.success('Password updated! You are now signed in.');
      navigate('/dashboard');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="premium-glass-strong p-7 sm:p-9 text-center">
        <p className="text-votora-muted mb-4">Invalid or missing reset link.</p>
        <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 font-medium">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="premium-glass-strong p-7 sm:p-9">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
        <p className="text-votora-muted text-sm mt-1">Choose a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <PasswordInput
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth loading={loading}>
          Update password
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
