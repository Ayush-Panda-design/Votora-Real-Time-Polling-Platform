import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiZap, FiShare2, FiUserCheck, FiTarget,
} from 'react-icons/fi';
import SectionGuide from '../../../components/ui/SectionGuide';

const HelpPage = () => {
  const [showGuidesAgain, setShowGuidesAgain] = useState(false);

  const handleRestoreGuides = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('votora-guide-')) localStorage.removeItem(key);
    });
    setShowGuidesAgain(true);
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6">
          <FiZap className="animate-pulse" /> HELP CENTER
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Everything you need to <span className="text-cyan-500">master Votora</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Expand any guide card below for step-by-step instructions — no trial and error required.
        </p>
      </motion.div>

      <SectionGuide page="help" key={showGuidesAgain ? 'restored' : 'default'} />

      <div className="flex justify-center mb-12">
        <button
          type="button"
          onClick={handleRestoreGuides}
          className="text-xs text-votora-muted hover:text-cyan-400 transition-colors underline underline-offset-2"
        >
          Show hidden guides on all pages again
        </button>
      </div>

      <div className="bg-cyan-500/5 rounded-[40px] p-10 md:p-16 border border-cyan-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="col-span-1">
            <h2 className="text-3xl font-bold text-white mb-6">Why use Votora?</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Real-time polling built for meetings, classrooms, and events — simple for you, fast for your audience.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="text-cyan-400 text-xl font-bold flex items-center gap-2">
                <FiZap /> Real-Time Sync
              </div>
              <p className="text-gray-500 text-sm">When someone votes, charts update instantly across every screen.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-emerald-400 text-xl font-bold flex items-center gap-2">
                <FiUserCheck /> Zero Friction
              </div>
              <p className="text-gray-500 text-sm">Anonymous voting without accounts — unless you enable secure quiz mode.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-purple-400 text-xl font-bold flex items-center gap-2">
                <FiTarget /> Cross-Device
              </div>
              <p className="text-gray-500 text-sm">Polls look great on phones, tablets, and desktops.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-pink-400 text-xl font-bold flex items-center gap-2">
                <FiShare2 /> One-Click Share
              </div>
              <p className="text-gray-500 text-sm">Copy a short link and share anywhere to start collecting votes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
