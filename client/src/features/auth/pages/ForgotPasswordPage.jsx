import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import notify from '../../../utils/notify';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data.devResetToken) {
        setDevToken(res.data.devResetToken);
        notify.success('Dev mode: reset token generated');
      } else {
        notify.success(res.data.message);
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-glass-strong p-7 sm:p-9">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Forgot password</h1>
        <p className="text-votora-muted text-sm mt-1">We&apos;ll send you a reset link if the email exists</p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-votora-muted">
            If an account exists for <span className="text-white">{email}</span>, check your inbox for reset instructions.
          </p>
          {devToken && (
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sm">
              <p className="text-cyan-400 font-medium mb-2">Development reset token</p>
              <Link
                to={`/reset-password?token=${devToken}`}
                className="text-white underline break-all"
              >
                /reset-password?token={devToken}
              </Link>
            </div>
          )}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Button type="submit" fullWidth loading={loading}>
            Send reset link
          </Button>
          <p className="text-center text-sm text-votora-muted">
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
