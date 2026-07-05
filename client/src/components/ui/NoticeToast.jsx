import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX,
} from 'react-icons/fi';

const TYPE_CONFIG = {
  success: {
    icon: FiCheckCircle,
    title: 'Success',
    accent: 'from-emerald-500/25 to-emerald-500/5',
    border: 'border-emerald-500/40',
    ring: 'ring-emerald-500/30',
    iconColor: 'text-emerald-400',
    bar: 'bg-emerald-400',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.25)]',
  },
  error: {
    icon: FiXCircle,
    title: 'Error',
    accent: 'from-red-500/25 to-red-500/5',
    border: 'border-red-500/40',
    ring: 'ring-red-500/30',
    iconColor: 'text-red-400',
    bar: 'bg-red-400',
    glow: 'shadow-[0_0_48px_rgba(239,68,68,0.3)]',
  },
  info: {
    icon: FiInfo,
    title: 'Notice',
    accent: 'from-cyan-500/25 to-cyan-500/5',
    border: 'border-cyan-500/40',
    ring: 'ring-cyan-500/30',
    iconColor: 'text-cyan-400',
    bar: 'bg-cyan-400',
    glow: 'shadow-[0_0_40px_rgba(34,211,238,0.22)]',
  },
  warning: {
    icon: FiAlertTriangle,
    title: 'Warning',
    accent: 'from-amber-500/25 to-amber-500/5',
    border: 'border-amber-500/40',
    ring: 'ring-amber-500/30',
    iconColor: 'text-amber-400',
    bar: 'bg-amber-400',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.22)]',
  },
  blank: {
    icon: FiInfo,
    title: null,
    accent: 'from-white/10 to-white/5',
    border: 'border-white/15',
    ring: 'ring-white/10',
    iconColor: 'text-white',
    bar: 'bg-cyan-400',
    glow: 'shadow-[0_0_32px_rgba(0,0,0,0.5)]',
  },
};

const NoticeToast = ({
  t,
  message,
  type = 'success',
  title: titleOverride,
  duration = 4500,
  emoji,
}) => {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.blank;
  const Icon = cfg.icon;
  const [progress, setProgress] = useState(100);
  const displayTitle = titleOverride ?? cfg.title;

  useEffect(() => {
    if (!t.duration || t.duration === Infinity) return undefined;

    const total = duration;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / total) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(tick);
    }, 40);

    return () => clearInterval(tick);
  }, [t.duration, duration]);

  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: -80, scale: 0.85, rotateX: -12 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
          type: 'spring',
          stiffness: 420,
          damping: 22,
          mass: 0.85,
        },
      }}
      exit={{
        opacity: 0,
        y: -40,
        scale: 0.92,
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
      }}
      className={`
        pointer-events-auto w-[min(100vw-2rem,28rem)]
        rounded-2xl border-2 ${cfg.border} ring-2 ${cfg.ring}
        bg-gradient-to-br ${cfg.accent} backdrop-blur-xl
        premium-glass-strong overflow-hidden ${cfg.glow}
      `}
      style={{ transformPerspective: 800 }}
    >
      {/* Top shimmer on enter */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0.8 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`h-1 origin-left ${cfg.bar}`}
      />

      <div className="flex items-start gap-4 p-4 sm:p-5">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.08 }}
          className={`w-12 h-12 rounded-xl bg-black/35 border ${cfg.border} flex items-center justify-center flex-shrink-0 ${cfg.iconColor}`}
        >
          {emoji ? <span className="text-2xl leading-none">{emoji}</span> : <Icon size={24} strokeWidth={2.5} />}
        </motion.div>

        <div className="flex-1 min-w-0 pt-0.5">
          {displayTitle && (
            <p className={`text-[11px] font-bold uppercase tracking-[0.14em] mb-1 ${cfg.iconColor}`}>
              {displayTitle}
            </p>
          )}
          <p className="text-[15px] sm:text-base font-semibold text-white leading-snug">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          className="p-1.5 rounded-lg text-votora-muted hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 -mr-1 -mt-1"
          aria-label="Dismiss notification"
        >
          <FiX size={18} />
        </button>
      </div>

      {t.duration !== Infinity && (
        <div className="h-1 bg-black/30 mx-4 mb-4 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${cfg.bar}`}
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.04 }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default NoticeToast;
