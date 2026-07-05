import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHelpCircle, FiX, FiInfo, FiBookOpen } from 'react-icons/fi';
import { HELP_CONTENT } from '../../constants/helpContent';

const ContextualHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();


  const getHelpContent = () => {
    const path = Object.keys(HELP_CONTENT).find(p => location.pathname.startsWith(p));
    return HELP_CONTENT[path] || HELP_CONTENT.default;
  };

  const content = getHelpContent();

  return (
    <>
    
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-cyan-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-cyan-500 transition-colors"
      >
        {isOpen ? <FiX size={24} /> : <FiHelpCircle size={24} />}
      </motion.button>

  
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
            />

            {/* Content Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#1a1a1a] border-l border-white/[0.08] z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-cyan-400">
                    <FiBookOpen size={24} />
                    <h2 className="text-xl font-bold text-white">How it works</h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{content.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{content.description}</p>
                  </div>

                  <div className="space-y-6">
                    {content.items.map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="mt-1 text-cyan-400 flex-shrink-0">
                          <FiInfo size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                          <p className="text-xs text-gray-400 leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/[0.08]">
                    <div className="bg-cyan-500/10 rounded-2xl p-6 border border-cyan-500/20">
                      <p className="text-sm font-medium text-cyan-400 mb-2">Need more help?</p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        If you're still stuck, reach out to our team at support@Votora.io or visit our full documentation center.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContextualHelp;

