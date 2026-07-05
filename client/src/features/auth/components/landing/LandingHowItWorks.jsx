import { motion } from 'framer-motion';
import { FiEdit3, FiShare2, FiTrendingUp } from 'react-icons/fi';

const steps = [
  {
    icon: FiEdit3,
    title: 'Create',
    desc: 'Build polls or quizzes with timers, PIN locks, and quiz scoring in minutes.',
    color: '#22d3ee',
  },
  {
    icon: FiShare2,
    title: 'Share',
    desc: 'Send one link — audience joins instantly from any device, no app required.',
    color: '#5b8ef0',
  },
  {
    icon: FiTrendingUp,
    title: 'Analyze',
    desc: 'Watch votes stream in live. Export CSV or publish results publicly.',
    color: '#a78bfa',
  },
];

/** Animations 9 & 10 — staggered step cards + connecting line draw */
const LandingHowItWorks = () => (
  <section id="how-it-works" className="landing-section">
    <div className="landing-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="landing-section-head"
      >
        <p className="landing-label">How it works</p>
        <h2 className="landing-display">Three steps to live engagement</h2>
      </motion.div>

      <div className="landing-steps-wrap">
        <svg className="landing-steps-line" viewBox="0 0 800 12" preserveAspectRatio="none">
          <motion.line
            x1="0" y1="6" x2="800" y2="6"
            stroke="url(#stepGrad)"
            strokeWidth="2"
            strokeDasharray="800"
            initial={{ strokeDashoffset: 800 }}
            whileInView={{ strokeDashoffset: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="stepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#5b8ef0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        <div className="landing-steps-grid">
          {steps.map((step, i) => (
            <motion.article
              key={step.title}
              className="landing-step-card"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <motion.div
                className="landing-step-icon"
                style={{ borderColor: `${step.color}44`, color: step.color }}
                animate={{ boxShadow: [`0 0 0 0 ${step.color}00`, `0 0 24px 2px ${step.color}22`, `0 0 0 0 ${step.color}00`] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
              >
                <step.icon size={22} />
              </motion.div>
              <span className="landing-step-num">0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default LandingHowItWorks;
