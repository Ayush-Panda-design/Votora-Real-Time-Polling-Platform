import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiChevronDown, FiChevronUp, FiZap, FiX } from 'react-icons/fi';
import { PAGE_GUIDES } from '../../constants/pageGuides';

const ACCENTS = {
  cyan:    { ring: 'border-cyan-500/25',    bg: 'from-cyan-500/12 to-cyan-500/4',    icon: 'text-cyan-400',    dot: 'bg-cyan-400' },
  emerald: { ring: 'border-emerald-500/25', bg: 'from-emerald-500/12 to-emerald-500/4', icon: 'text-emerald-400', dot: 'bg-emerald-400' },
  blue:    { ring: 'border-blue-500/25',    bg: 'from-blue-500/12 to-blue-500/4',    icon: 'text-blue-400',    dot: 'bg-blue-400' },
  amber:   { ring: 'border-amber-500/25',   bg: 'from-amber-500/12 to-amber-500/4',   icon: 'text-amber-400',   dot: 'bg-amber-400' },
  purple:  { ring: 'border-purple-500/25',  bg: 'from-purple-500/12 to-purple-500/4',  icon: 'text-purple-400',  dot: 'bg-purple-400' },
  rose:    { ring: 'border-rose-500/25',    bg: 'from-rose-500/12 to-rose-500/4',    icon: 'text-rose-400',    dot: 'bg-rose-400' },
};

export function GuideCard({ card, isOpen, onToggle, index }) {
  const a = ACCENTS[card.accent] || ACCENTS.cyan;
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border bg-gradient-to-br ${a.bg} ${a.ring} overflow-hidden transition-shadow hover:shadow-lg hover:shadow-black/20`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-4 sm:p-5 text-left group"
        aria-expanded={isOpen}
      >
        <div className={`w-11 h-11 rounded-xl bg-black/30 border ${a.ring} flex items-center justify-center flex-shrink-0 ${a.icon} group-hover:scale-105 transition-transform`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-sm sm:text-base font-bold text-white mb-1">{card.title}</h4>
          <p className="text-xs sm:text-sm text-votora-muted leading-relaxed">{card.summary}</p>
        </div>
        <div className={`mt-1 p-1.5 rounded-lg bg-black/25 text-votora-muted group-hover:text-white transition-colors flex-shrink-0 ${isOpen ? 'text-cyan-400' : ''}`}>
          {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-white/[0.06] mx-4 sm:mx-5">
              <ol className="mt-4 space-y-3">
                {card.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                    <span className={`w-6 h-6 rounded-lg ${a.dot}/20 flex items-center justify-center text-[11px] font-bold ${a.icon} flex-shrink-0 mt-0.5`}>
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {card.tip && (
                <div className="mt-4 flex gap-2 p-3 rounded-xl bg-cyan-500/8 border border-cyan-500/15">
                  <FiZap className="text-cyan-400 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-cyan-200/90 leading-relaxed"><span className="font-semibold text-cyan-400">Pro tip: </span>{card.tip}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Collapsible section guide — panel pop-down + per-card accordion.
 * @param {{ page: keyof typeof PAGE_GUIDES, className?: string, defaultOpen?: boolean }} props
 */
const SectionGuide = ({ page, className = '', defaultOpen }) => {
  const guide = PAGE_GUIDES[page];
  const storageKey = `votora-guide-${page}`;

  const [panelOpen, setPanelOpen] = useState(() => {
    if (typeof window === 'undefined') return defaultOpen ?? true;
    const stored = localStorage.getItem(storageKey);
    if (stored === 'closed') return false;
    if (stored === 'open') return true;
    return defaultOpen ?? true;
  });

  const [openCards, setOpenCards] = useState(() => new Set([guide?.cards?.[0]?.id].filter(Boolean)));
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`${storageKey}-dismissed`) === '1';
  });

  useEffect(() => {
    localStorage.setItem(storageKey, panelOpen ? 'open' : 'closed');
  }, [panelOpen, storageKey]);

  if (!guide || dismissed) return null;

  const toggleCard = (id) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(`${storageKey}-dismissed`, '1');
  };

  return (
    <div className={`mb-8 ${className}`}>
      {/* Panel header — always visible; click to pop up / pop down */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent overflow-hidden">
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition-colors"
          aria-expanded={panelOpen}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <FiBookOpen size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400/80 mb-0.5">
              Quick guide · {guide.label}
            </p>
            <h3 className="text-base sm:text-lg font-bold text-white truncate">{guide.title}</h3>
            {!panelOpen && (
              <p className="text-xs text-votora-muted mt-1 truncate">{guide.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-semibold text-votora-muted hidden sm:inline">
              {panelOpen ? 'Collapse' : 'Expand'}
            </span>
            <div className="p-2 rounded-xl bg-black/30 text-cyan-400">
              {panelOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {panelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-5 pb-5 border-t border-white/[0.06]">
                <div className="flex items-start justify-between gap-3 pt-4 pb-3">
                  <p className="text-sm text-votora-muted leading-relaxed">{guide.subtitle}</p>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-votora-muted hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                    title="Hide guide on this page"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {guide.cards.map((card, i) => (
                    <GuideCard
                      key={card.id}
                      card={card}
                      index={i}
                      isOpen={openCards.has(card.id)}
                      onToggle={() => toggleCard(card.id)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SectionGuide;
