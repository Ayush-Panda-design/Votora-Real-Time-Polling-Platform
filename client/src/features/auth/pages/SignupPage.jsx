import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, googleLogin } from '../authSlice';
import { FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import notify from '../../../utils/notify';
import Input, { PasswordInput } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const isGoogleEnabled =
  import.meta.env.VITE_GOOGLE_CLIENT_ID &&
  import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);

  const redirect = new URLSearchParams(location.search).get('redirect');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      notify.error('Password must be at least 6 characters');
      return;
    }
    const res = await dispatch(signupUser(form));
    if (signupUser.fulfilled.match(res)) {
      const { message, devVerifyToken } = res.payload;
      notify.success(message || 'Account created! Check your email to verify.', {
        duration: 7000,
        title: 'Account created',
      });
      if (devVerifyToken) {
        notify.info(
          `Dev verify URL: /verify-email?token=${devVerifyToken.slice(0, 8)}…`,
          { duration: 14000, title: 'Development mode' }
        );
      }
      navigate('/login');
    } else {
      notify.error(res.payload);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await dispatch(googleLogin(credentialResponse.credential));
    if (googleLogin.fulfilled.match(res)) {
      notify.success('Signed in with Google!');
      const user = res.payload.user;
      navigate(redirect || (user.onboardingCompleted ? '/dashboard' : '/onboarding'));
    } else {
      notify.error(res.payload);
    }
  };

  return (
    <div className="premium-glass-strong p-7 sm:p-9">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
        <p className="text-votora-muted text-sm mt-1">Start building live polls in minutes</p>
      </div>

      {isGoogleEnabled && (
        <>
          <div className="flex justify-center mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => notify.error('Google auth failed')}
              theme="filled_black"
              shape="pill"
              text="signup_with"
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
          label="Full name"
          name="name"
          type="text"
          placeholder="Jane Doe"
          value={form.name}
          onChange={handleChange}
          required
          autoComplete="name"
        />
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
          placeholder="Min. 6 characters"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
          hint="At least 6 characters"
        />
        <Button type="submit" fullWidth loading={loading} icon={!loading && <FiArrowRight size={15} />}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-votora-muted mt-6">
        Already have an account?{' '}
        <Link
          to={`/login${redirect ? `?redirect=${redirect}` : ''}`}
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
