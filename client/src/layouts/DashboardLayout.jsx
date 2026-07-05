import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiPlus, FiUser, FiLogOut, FiMenu, FiX, FiBook, FiShield } from 'react-icons/fi';
import notify from '../utils/notify';
import Logo from '../components/ui/Logo';
import { PremiumBackground } from '../components/ui/PremiumUI';

const navLinks = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/polls/create', icon: FiPlus, label: 'Create poll' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
  { to: '/help', icon: FiBook, label: 'Help' },
];

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    notify.success('Signed out');
    navigate('/login');
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-votora-bg text-white flex overflow-x-hidden relative">
      <PremiumBackground />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[268px] premium-glass border-r border-white/[0.06] flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
          <Logo onClick={() => { navigate('/'); closeMobile(); }} />
          <button type="button" onClick={closeMobile} className="lg:hidden btn-ghost p-2">
            <FiX size={18} />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="premium-badge w-full justify-center">
            <FiShield size={10} /> Secure workspace
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMobile}
              className={({ isActive }) => (isActive ? 'premium-sidebar-link-active' : 'premium-sidebar-link-inactive')}
            >
              <link.icon size={17} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-4 space-y-2">
          <button
            type="button"
            onClick={() => { navigate('/profile'); closeMobile(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-black/25 border border-white/[0.06] hover:border-cyan-500/20 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/25 flex items-center justify-center text-sm font-bold text-cyan-300 flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-votora-muted truncate">{user?.email}</p>
            </div>
          </button>
          <button type="button" onClick={handleLogout} className="w-full btn-danger py-2.5 text-xs">
            <FiLogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 flex items-center justify-between px-5 sm:px-6 border-b border-white/[0.06] premium-glass sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="btn-secondary p-2 lg:hidden">
              <FiMenu size={18} />
            </button>
            <span className="text-[11px] font-semibold text-votora-muted uppercase tracking-[0.18em] hidden sm:inline">
              Workspace
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
