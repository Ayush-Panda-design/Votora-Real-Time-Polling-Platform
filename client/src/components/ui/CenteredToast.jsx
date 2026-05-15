import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const CenteredToast = ({ t, message, type = 'success' }) => {
  const icons = {
    success: <FiCheckCircle className="text-emerald-500" />,
    error: <FiXCircle className="text-red-500" />,
    loading: <FiInfo className="text-cyan-500 animate-spin" />,
    blank: <FiInfo className="text-cyan-500" />,
  };

  const handleDismiss = () => toast.dismiss(t.id);

  return (
    <div className="relative pointer-events-none flex items-center justify-center">
      {/* Backdrop (Only if needed, but since it's a toast, we might want it to be per-toast or global) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto -z-10"
        onClick={handleDismiss}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`
          relative z-10 max-w-sm w-full bg-[#151515] border border-white/10 
          rounded-[24px] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-6
          pointer-events-auto
        `}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">
          {icons[type] || icons.blank}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-white tracking-tight uppercase italic">
            {type === 'success' ? 'Perfect' : type === 'error' ? 'Attention' : 'Notice'}
          </h3>
          <p className="text-gray-400 text-[15px] leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-[13px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(6,182,212,0.3)]"
        >
          OK
        </button>
      </motion.div>
    </div>
  );
};

export default CenteredToast;
