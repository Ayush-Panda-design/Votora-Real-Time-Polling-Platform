import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

const CenteredToast = ({ t, message, type = 'success' }) => {
  const config = {
    success: { icon: <FiCheckCircle className="text-emerald-400" size={32} />, title: 'Success', ring: 'ring-emerald-500/30', border: 'border-emerald-500/30' },
    error:   { icon: <FiXCircle className="text-red-400" size={32} />, title: 'Something went wrong', ring: 'ring-red-500/30', border: 'border-red-500/30' },
    loading: { icon: <FiInfo className="text-cyan-400 animate-spin" size={32} />, title: 'Please wait', ring: 'ring-cyan-500/30', border: 'border-cyan-500/30' },
    blank:   { icon: <FiInfo className="text-cyan-400" size={32} />, title: 'Notice', ring: 'ring-cyan-500/30', border: 'border-cyan-500/30' },
  };

  const { icon, title, ring, border } = config[type] || config.blank;
  const handleDismiss = () => toast.dismiss(t.id);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
        onClick={handleDismiss}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 40, rotateX: -15 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          transition: { type: 'spring', stiffness: 380, damping: 24 },
        }}
        exit={{ opacity: 0, scale: 0.88, y: 24, transition: { duration: 0.2 } }}
        className={`relative z-10 max-w-sm w-full premium-glass-strong p-8 flex flex-col items-center text-center gap-5 pointer-events-auto border-2 ${border} ring-4 ${ring} shadow-[0_0_60px_rgba(6,182,212,0.15)]`}
        style={{ transformPerspective: 900 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 480, damping: 16, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
        >
          {icon}
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-votora-muted text-sm leading-relaxed">{message}</p>
        </div>
        <button type="button" onClick={handleDismiss} className="btn-primary w-full py-3 text-base font-semibold">
          Got it
        </button>
      </motion.div>
    </div>
  );
};

export default CenteredToast;
