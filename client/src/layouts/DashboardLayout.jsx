import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiPlus,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiBook
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Logo from '../components/ui/Logo';

const navLinks = [
  { to: '/help', icon: <FiBook />, label: 'Help & Documentation' },
  { to: '/dashboard', icon: <FiHome />, label: 'Home' },
  { to: '/polls/create', icon: <FiPlus />, label: 'Create' },
  { to: '/profile', icon: <FiUser />, label: 'Profile' },
];

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex overflow-x-hidden">
      
      {/* */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#151515] flex flex-col
        transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4">
          <Logo onClick={() => { navigate('/'); closeMobileMenu(); }} />
          <button onClick={closeMobileMenu} className="lg:hidden text-gray-500 hover:text-white p-2">
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 px-3 mt-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all
                ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-[#1a1a1a]'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* USER SECTION */}
        <div className="border-t border-white/5 p-4">
          <div
            onClick={() => { navigate('/profile'); closeMobileMenu(); }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 p-2 rounded-xl transition-all shadow-lg shadow-black/20 mb-2"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-sm font-semibold text-cyan-400 shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm truncate text-gray-200 font-bold">{user?.name}</p>
              <p className="text-[11px] text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => { navigate('/help'); closeMobileMenu(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-gray-400 bg-white/5 hover:bg-white/10 border border-white/5 transition-all mb-2"
          >
            <FiBook size={14} />
            <span>View Documentation</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all"
          >
            <FiLogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col bg-[#0f0f0f] min-w-0">

        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#151515]/60 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white lg:hidden"
            >
              <FiMenu size={20} />
            </button>
            <div className="text-[13px] font-bold text-gray-600 uppercase tracking-widest hidden sm:block">
              Workspace
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
             <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tighter">Live Status</span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 lg:p-10 max-w-7xl mx-auto w-full"
          >
            <Outlet />
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default DashboardLayout;