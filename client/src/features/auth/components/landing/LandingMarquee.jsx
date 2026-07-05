import { motion } from 'framer-motion';

const items = [
  'Live Classrooms', 'Team Standups', 'Product Launches', 'Community AMAs',
  'Hackathon Voting', 'Event Feedback', 'Quiz Nights', 'Town Halls',
  'UX Research', 'Conference Q&A', 'Startup Pitches', 'Training Sessions',
];

/** Animation 11 — infinite marquee ticker */
const LandingMarquee = () => (
  <section className="landing-marquee-section" aria-hidden="true">
    <div className="landing-marquee-fade landing-marquee-fade-left" />
    <div className="landing-marquee-fade landing-marquee-fade-right" />
    <motion.div
      className="landing-marquee-track"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
    >
      {[...items, ...items].map((item, i) => (
        <span key={`${item}-${i}`} className="landing-marquee-item">
          <span className="landing-marquee-dot" />
          {item}
        </span>
      ))}
    </motion.div>
  </section>
);

export default LandingMarquee;
