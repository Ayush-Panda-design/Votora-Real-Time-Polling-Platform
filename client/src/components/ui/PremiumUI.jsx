import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from './Button';

export const PremiumBackground = () => (
  <div className="premium-mesh" aria-hidden="true" />
);

export const Eyebrow = ({ children, live = false }) => (
  <div className="eyebrow mb-4">
    {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
    {children}
  </div>
);

export const SectionHeader = ({ eyebrow, title, subtitle, live }) => (
  <div className="mb-8">
    {eyebrow && <Eyebrow live={live}>{eyebrow}</Eyebrow>}
    <h1 className="page-title">{title}</h1>
    {subtitle && <p className="page-subtitle">{subtitle}</p>}
  </div>
);

export const PageHero = ({ eyebrow, title, highlight, subtitle, action, live }) => (
  <div className="relative overflow-hidden rounded-4xl border border-white/[0.07] premium-glass-strong p-7 md:p-10 mb-8">
    <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
      <div>
        {eyebrow && <Eyebrow live={live}>{eyebrow}</Eyebrow>}
        <h1 className="text-3xl sm:text-[2.75rem] font-bold tracking-tight leading-[1.05] text-white">
          {title}
          {highlight && (
            <span className="block gradient-text mt-1">{highlight}</span>
          )}
        </h1>
        {subtitle && <p className="page-subtitle mt-4">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  </div>
);

export const StatCard = ({ label, value, icon, accent = 'cyan', hint }) => {
  const accents = {
    cyan:    { bg: 'from-cyan-500/15 to-cyan-500/5',    icon: 'text-cyan-400',    ring: 'border-cyan-500/15' },
    emerald: { bg: 'from-emerald-500/15 to-emerald-500/5', icon: 'text-emerald-400', ring: 'border-emerald-500/15' },
    blue:    { bg: 'from-blue-500/15 to-blue-500/5',    icon: 'text-blue-400',    ring: 'border-blue-500/15' },
    amber:   { bg: 'from-amber-500/15 to-amber-500/5',  icon: 'text-amber-400',   ring: 'border-amber-500/15' },
  };
  const a = accents[accent] || accents.cyan;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br ${a.bg} p-5 sm:p-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-votora-muted font-semibold mb-2">{label}</p>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-2xl bg-votora-card border ${a.ring} flex items-center justify-center ${a.icon}`}>
          {icon}
        </div>
      </div>
      {hint && <p className="text-xs text-votora-muted mt-4">{hint}</p>}
    </motion.div>
  );
};

export const SearchInput = ({ value, onChange, placeholder = 'Search…', className = '' }) => (
  <div className={`relative flex-1 ${className}`}>
    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-votora-muted pointer-events-none" size={16} />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-black/30 border border-white/[0.07] text-votora-text
        placeholder:text-votora-muted outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all"
    />
  </div>
);

export const FilterPills = ({ options, value, onChange }) => (
  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
    {options.map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => onChange(item.value)}
        className={`px-4 h-11 rounded-xl text-[13px] font-semibold capitalize transition-all whitespace-nowrap border ${
          value === item.value
            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/5'
            : 'bg-votora-card border-white/[0.07] text-votora-muted hover:text-white hover:border-white/[0.12]'
        }`}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export const FilterBar = ({ search, onSearchChange, searchPlaceholder, filters, filter, onFilterChange }) => (
  <div className="rounded-3xl border border-white/[0.07] premium-glass p-4 sm:p-5 mb-8">
    <div className="flex flex-col xl:flex-row xl:items-center gap-4">
      <SearchInput value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
      {filters && <FilterPills options={filters} value={filter} onChange={onFilterChange} />}
    </div>
  </div>
);

export const EmptyState = ({ icon, title, description, actionLabel, actionTo, onAction }) => (
  <div className="rounded-4xl border border-white/[0.07] premium-glass py-20 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl mx-auto mb-5">
      {icon}
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-votora-muted text-sm max-w-md mx-auto leading-relaxed mb-7">{description}</p>
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-primary inline-flex">
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);

export const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel, loading }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="relative z-10 w-full max-w-md premium-glass-strong p-6 sm:p-7"
          role="dialog"
          aria-modal="true"
        >
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-votora-muted leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            >
              {loading ? 'Please wait…' : confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const SecurityScore = ({ score }) => {
  const level = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : score >= 25 ? 'Basic' : 'Minimal';
  const color = score >= 80 ? 'from-emerald-500 to-cyan-500' : score >= 50 ? 'from-cyan-500 to-blue-500' : 'from-amber-500 to-orange-500';

  return (
    <div className="premium-glass p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-votora-muted">Security Score</span>
        <span className={`text-xs font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{level}</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-white tabular-nums">{score}</span>
        <span className="text-sm text-votora-muted mb-1">/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
};

export const PremiumToggle = ({ label, desc, value, onClick, icon: Icon, premium }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
      value
        ? 'border-cyan-500/35 bg-gradient-to-r from-cyan-500/[0.08] to-blue-500/[0.04]'
        : 'border-white/[0.06] bg-black/20 hover:border-white/10 hover:bg-white/[0.02]'
    }`}
  >
    <div className="flex items-center gap-3 min-w-0">
      {Icon && (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          value ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-votora-muted'
        }`}>
          <Icon size={16} />
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-[13px] font-semibold truncate ${value ? 'text-gray-100' : 'text-votora-subtle'}`}>{label}</p>
          {premium && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">Pro</span>
          )}
        </div>
        <p className="text-[11px] text-votora-muted mt-0.5">{desc}</p>
      </div>
    </div>
    <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${value ? 'bg-cyan-500' : 'bg-gray-700'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
    </div>
  </button>
);

// eslint-disable-next-line react-refresh/only-export-components -- shared with CreatePollPage
export const calcSecurityScore = (form) => {
  let score = 10;
  const domains = Array.isArray(form.allowedDomains)
    ? form.allowedDomains.filter(Boolean)
    : (form.allowedDomains || '').split(',').map((d) => d.trim()).filter(Boolean);

  if (form.requiresAuth) score += 20;
  if (form.accessCode?.trim()) score += 25;
  if (form.cheatProtection) score += 15;
  if (domains.length) score += 10;
  if (form.maxResponses) score += 10;
  if (form.shuffleOptions) score += 10;
  if (!form.isAnonymous) score += 5;
  if (form.timeLimitSystem !== 'none') score += 10;
  return Math.min(score, 100);
};
