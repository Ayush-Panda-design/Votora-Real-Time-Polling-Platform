import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, googleLogin } from '../authSlice';
import { FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import notify from '../../../utils/notify';
import Input, { PasswordInput } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const isGoogleEnabled =
  import.meta.env.VITE_GOOGLE_CLIENT_ID &&
  import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);

  const redirect = new URLSearchParams(location.search).get('redirect');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const navigateAfterAuth = (user) => {
    const target = redirect || (user.onboardingCompleted ? '/dashboard' : '/onboarding');
    navigate(target);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(res)) {
      notify.success('Welcome back!');
      navigateAfterAuth(res.payload.user);
    } else {
      notify.error(res.payload);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await dispatch(googleLogin(credentialResponse.credential));
    if (googleLogin.fulfilled.match(res)) {
      notify.success('Logged in with Google!');
      navigateAfterAuth(res.payload.user);
    } else {
      notify.error(res.payload);
    }
  };

  return (
    <div className="premium-glass-strong p-7 sm:p-9">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="text-votora-muted text-sm mt-1">Sign in to your Votora workspace</p>
      </div>

      {isGoogleEnabled && (
        <>
          <div className="flex justify-center mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => notify.error('Google login failed')}
              theme="filled_black"
              shape="pill"
              text="signin_with"
              width="340"
            />
          </div>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[11px] text-votora-muted uppercase tracking-wider">or email</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        <PasswordInput
          label="Password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
        <div className="text-right -mt-1">
          <Link
            to="/forgot-password"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={loading} icon={!loading && <FiArrowRight size={15} />}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-votora-muted mt-6">
        Don&apos;t have an account?{' '}
        <Link
          to={`/signup${redirect ? `?redirect=${redirect}` : ''}`}
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
