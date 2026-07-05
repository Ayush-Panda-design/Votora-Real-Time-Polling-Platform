import { motion } from 'framer-motion';
import { FiBarChart2, FiUsers, FiZap } from 'react-icons/fi';

/** Animation 12 — layered dashboard UI mock with spring entrance */
const LandingDashboardIllustration = () => (
  <section className="landing-section landing-showcase-section">
    <div className="landing-container landing-showcase-grid">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="landing-showcase-copy"
      >
        <p className="landing-label">Creator dashboard</p>
        <h2 className="landing-display">
          Your command center for
          <em> live audience data</em>
        </h2>
        <p className="landing-muted">
          Manage polls, watch analytics update in real time, share presentation mode on the big screen,
          and export responses — all from one premium workspace.
        </p>
        <ul className="landing-showcase-list">
          {[
            { icon: FiZap, text: 'Socket-powered live vote counters' },
            { icon: FiBarChart2, text: 'Bar & pie charts via Recharts' },
            { icon: FiUsers, text: 'Participant rooms & auth modes' },
          ].map((item, i) => (
            <motion.li
              key={item.text}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <item.icon size={16} />
              {item.text}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div className="landing-showcase-visual">
        <motion.div
          className="landing-ui-card landing-ui-card-back"
          initial={{ opacity: 0, rotate: -6, y: 40 }}
          whileInView={{ opacity: 0.6, rotate: -6, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 80, delay: 0.1 }}
        />
        <motion.div
          className="landing-ui-card landing-ui-card-mid"
          initial={{ opacity: 0, rotate: 3, y: 40 }}
          whileInView={{ opacity: 0.85, rotate: 3, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 90, delay: 0.2 }}
        />
        <motion.div
          className="landing-ui-card landing-ui-card-front"
          initial={{ opacity: 0, y: 50, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
        >
          <div className="landing-ui-header">
            <span className="landing-ui-dot red" />
            <span className="landing-ui-dot yellow" />
            <span className="landing-ui-dot green" />
            <span className="landing-ui-title">Analytics · Live</span>
          </div>
          <div className="landing-ui-bars">
            {[72, 58, 45, 38, 62].map((h, i) => (
              <motion.div
                key={i}
                className="landing-ui-bar"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
              />
            ))}
          </div>
          <motion.div
            className="landing-ui-live-badge"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="landing-live-pulse" />
            248 responses · updating
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default LandingDashboardIllustration;
