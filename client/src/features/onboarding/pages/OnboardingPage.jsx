import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { completeOnboarding } from '../../auth/authSlice';
import { USER_INTERESTS, USER_ROLES } from '../../../utils/constants';
import notify from '../../../utils/notify';

const steps = ['role', 'interests', 'done'];

const OnboardingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [interests, setInterests] = useState([]);

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const handleFinish = async () => {
    if (!role) {
      notify.error('Please select your role');
      return;
    }

    const res = await dispatch(
      completeOnboarding({ role, interests })
    );

    if (completeOnboarding.fulfilled.match(res)) {
      notify.success('Welcome to Votora!');
      navigate('/dashboard');
    } else {
      notify.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-6 relative overflow-hidden">

      {/* BACKGROUND  */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[620px] h-[320px] bg-[#3b82f6]/[0.07] blur-[180px]" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)',
            backgroundSize: '90px 90px',
          }}
        />
      </div>

      <div className="w-full max-w-2xl relative">

        {/* PROGRESS BAR */}
        <div className="flex gap-2 mb-10">
          {steps.slice(0, -1).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#3b82f6]' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 — ROLE */}
          {step === 0 && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <div className="rounded-2xl border border-white/[0.06] bg-[#151515] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">

                <h2 className="text-2xl font-bold tracking-[-0.02em]">
                  What best describes you?
                </h2>

                <p className="text-[#6b6b6b] text-[13px] mt-2 mb-6">
                  Help us personalize your experience
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {USER_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-4 rounded-xl border text-left text-sm transition-all ${
                        role === r
                          ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-white'
                          : 'border-white/[0.06] bg-[#1a1a1a] text-[#6b6b6b] hover:border-white/[0.15] hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(1)}
                  disabled={!role}
                  className="w-full mt-6 px-6 py-3 rounded-xl bg-[#f5f5f5] text-[#0a0a0a] font-semibold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — INTERESTS */}
          {step === 1 && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <div className="rounded-2xl border border-white/[0.06] bg-[#151515] p-8">

                <h2 className="text-2xl font-bold">
                  What will you use it for?
                </h2>

                <p className="text-[#6b6b6b] text-[13px] mt-2 mb-6">
                  Select all that apply
                </p>

                <div className="flex flex-wrap gap-3">
                  {USER_INTERESTS.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleInterest(item)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        interests.includes(item)
                          ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-white'
                          : 'border-white/[0.06] bg-[#1a1a1a] text-[#6b6b6b] hover:border-white/[0.15] hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(0)}
                    className="px-5 py-3 rounded-xl border border-white/[0.06] bg-[#1a1a1a] text-[#6b6b6b] hover:text-white transition"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleFinish}
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-xl bg-[#f5f5f5] text-[#0a0a0a] font-semibold hover:bg-white transition disabled:opacity-40"
                  >
                    {loading ? 'Finishing...' : 'Finish Setup'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;