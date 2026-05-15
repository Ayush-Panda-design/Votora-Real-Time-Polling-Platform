import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, googleLogin } from '../authSlice';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Input from '../../../components/ui/Input';
import Logo from '../../../components/ui/Logo';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [show, setShow] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const res = await dispatch(signupUser(form));

    if (signupUser.fulfilled.match(res)) {
      toast.success('Account created!');
      const target = redirect || '/onboarding';
      navigate(target);
    } else {
      toast.error(res.payload);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await dispatch(
      googleLogin(credentialResponse.credential)
    );

    if (googleLogin.fulfilled.match(res)) {
      toast.success('Signed in with Google!');
      const user = res.payload.user;
      const target = redirect || (user.onboardingCompleted ? '/dashboard' : '/onboarding');
      navigate(target);
    } else {
      toast.error(res.payload);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-6 relative overflow-hidden">

      { }
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[620px] h-[320px] bg-cyan-500/[0.05] blur-[180px]" />
        <div
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage:
              'linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px]"
      >
        <div className="rounded-3xl border border-white/[0.06] bg-[#151515] p-6 sm:p-10 shadow-[0_40px_120px_rgba(0,0,0,0.8)]">

          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <Logo />
            </div>

            <h1 className="text-[28px] font-bold text-[#f5f5f5] tracking-[-0.02em]">
              Create your account
            </h1>

            <p className="text-[#6b6b6b] text-[13px] mt-1">
              Start building realtime polls instantly
            </p>
          </div>

          {/* GOOGLE */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here' && (
            <>
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Auth Failed')}
                  theme="filled_black"
                  shape="pill"
                  text="signup_with"
                  width="340"
                />
              </div>

              {/* DIVIDER */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-[11px] text-[#555] uppercase tracking-wider">
                  or continue with email
                </span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>
            </>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME */}
            <div>
              <label className="text-[13px] text-[#b0b0b0] mb-1 block">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#f5f5f5] placeholder:text-[#555] outline-none focus:border-[#3b82f6]/40 transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-[13px] text-[#b0b0b0] mb-1 block">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#f5f5f5] placeholder:text-[#555] outline-none focus:border-[#3b82f6]/40 transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-[13px] text-[#b0b0b0] mb-1 block">
                Password
              </label>

              <div className="relative">
                <input
                  name="password"
                  type={show ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#f5f5f5] placeholder:text-[#555] outline-none focus:border-[#3b82f6]/40 transition"
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition"
                >
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 px-6 py-3 rounded-xl bg-[#f5f5f5] text-[#0a0a0a] font-semibold text-[14px] hover:bg-white transition flex items-center justify-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Account'}
              <FiArrowRight className="text-[13px]" />
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-[13px] text-[#6b6b6b] mt-6">
            Already have an account?{' '}
            <Link
              to={`/login${redirect ? `?redirect=${redirect}` : ''}`}
              className="text-[#3b82f6] hover:text-[#60a5fa] font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;