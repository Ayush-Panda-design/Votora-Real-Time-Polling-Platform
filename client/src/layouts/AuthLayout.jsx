import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiShield, FiBarChart2, FiUsers } from 'react-icons/fi';
import Logo from '../components/ui/Logo';
import { PremiumBackground } from '../components/ui/PremiumUI';

const highlights = [
  { icon: FiZap, text: 'Real-time votes across every device' },
  { icon: FiBarChart2, text: 'Live analytics without refreshing' },
  { icon: FiUsers, text: 'Anonymous or authenticated audiences' },
  { icon: FiShield, text: 'PIN locks, domain rules & cheat protection' },
];

const AuthLayout = () => (
  <div className="min-h-screen bg-votora-bg text-white flex relative overflow-hidden">
    <PremiumBackground />

    {/* Brand panel */}
    <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] relative flex-col justify-between p-10 xl:p-12 border-r border-white/[0.06]">
      <div>
        <Logo />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-14"
        >
          <p className="premium-badge mb-5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Real-time polling platform
          </p>
          <h1 className="text-4xl xl:text-[2.75rem] font-bold tracking-tight leading-[1.08] text-white">
            Engage your audience
            <span className="block gradient-text mt-2">in real time</span>
          </h1>
          <p className="text-votora-muted text-[15px] leading-relaxed mt-5 max-w-md">
            Create beautiful polls, share instantly, and watch results update live — built for classrooms, events, and teams.
          </p>
        </motion.div>
      </div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        {highlights.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-sm text-votora-subtle">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Icon size={14} />
            </span>
            {text}
          </li>
        ))}
      </motion.ul>

      <p className="text-xs text-votora-muted">
        © {new Date().getFullYear()} Votora · Secure by default
      </p>
    </div>

    {/* Form panel */}
    <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[420px]"
      >
        <div className="lg:hidden flex justify-center mb-8">
          <Logo />
        </div>
        <Outlet />
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
