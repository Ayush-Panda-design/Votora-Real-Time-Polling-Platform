import { motion } from 'framer-motion';

/** Animation 8 — drifting gradient orbs + subtle grid */
const LandingBackground = () => (
  <div className="landing-bg" aria-hidden="true">
    <div className="landing-bg-grid" />
    <motion.div
      className="landing-orb landing-orb-cyan"
      animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.95, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="landing-orb landing-orb-blue"
      animate={{ x: [0, -50, 30, 0], y: [0, 40, -25, 0], scale: [1, 0.92, 1.06, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <motion.div
      className="landing-orb landing-orb-violet"
      animate={{ x: [0, 25, -35, 0], y: [0, 20, 35, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
  </div>
);

export default LandingBackground;
