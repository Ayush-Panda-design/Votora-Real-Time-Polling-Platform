import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiBarChart2,
  FiShare2,
  FiUsers,
  FiZap,
  FiShield,
  FiClock,
  FiLayers,
  FiCheckCircle,
  FiStar,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { HiOutlineChartBar } from 'react-icons/hi2';
import Logo from '../../../components/ui/Logo';

const features = [
  { icon: <FiZap />, title: 'Realtime Polling', desc: 'Votes update instantly across every connected device.' },
  { icon: <FiShare2 />, title: 'Easy Sharing', desc: 'Share polls with links, QR codes, or invite rooms.' },
  { icon: <FiBarChart2 />, title: 'Live Analytics', desc: 'Track audience engagement beautifully in realtime.' },
  { icon: <FiUsers />, title: 'Anonymous Voting', desc: 'Collect honest feedback without login friction.' },
];

const testimonials = [
  { name: 'Alex Johnson', role: 'Startup Founder', text: 'The smoothest realtime polling experience we have ever used.' },
  { name: 'Sophia Lee', role: 'Community Manager', text: 'Our audience engagement increased massively after using Votora.' },
];

const gallery = [
  {
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop',
    title: 'Interactive Classrooms',
    desc: 'Run engaging live quizzes and instant feedback sessions.',
  },
  {
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop',
    title: 'Community Discussions',
    desc: 'Create modern audience interaction for communities & creators.',
  },
  {
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1400&auto=format&fit=crop',
    title: 'Startup & Team Decisions',
    desc: 'Collect realtime opinions during meetings and live events.',
  },
];

const HERO_WORDS = ['Feels Instant', 'Looks Premium', 'Built for Realtime', 'Made for Communities'];

const LandingPage = () => {
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = HERO_WORDS[wordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentWord.substring(0, text.length + 1));
        if (text === currentWord) setTimeout(() => setIsDeleting(true), 1200);
      } else {
        setText(currentWord.substring(0, text.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % HERO_WORDS.length);
        }
      }
    }, isDeleting ? 40 : 85);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  const [polls, setPolls] = useState([
    { name: 'JavaScript', votes: 78 },
    { name: 'Python', votes: 63 },
    { name: 'Java', votes: 42 },
    { name: 'C++', votes: 29 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPolls((prev) =>
        prev.map((poll) => {
          const random = Math.floor(Math.random() * 5);
          let updatedVotes = poll.votes + random;
          if (updatedVotes > 100) updatedVotes = 40;
          return { ...poll, votes: updatedVotes };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: '#1c1c1c', color: '#eeebe5', overflowX: 'hidden', fontFamily: "'Sora', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400;1,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }

        .display { font-family: 'Playfair Display', Georgia, serif; }

        .nav-link {
          font-size: 13px; color: #6e6a64; font-weight: 500;
          transition: color 0.2s; letter-spacing: 0.01em;
        }
        .nav-link:hover { color: #eeebe5; }

        .btn-dark {
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #fff; border: none; cursor: pointer;
          font-family: 'Sora', sans-serif; font-weight: 600; font-size: 13.5px;
          letter-spacing: 0.02em; transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 12px 32px rgba(6,182,212,0.22);
        }
        .btn-dark:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 16px 40px rgba(6,182,212,0.28); }

        .btn-outline {
          background: transparent; color: #7a7570; cursor: pointer;
          border: 1px solid #2e2e2e; font-family: 'Sora', sans-serif;
          font-weight: 500; font-size: 13.5px; letter-spacing: 0.01em;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .btn-outline:hover { border-color: #4a4540; color: #eeebe5; background: rgba(255,255,255,0.03); }

        .card {
          background: #242424; border: 1px solid #2c2c2c; border-radius: 18px;
          transition: border-color 0.25s, transform 0.25s, background 0.25s;
        }
        .card:hover { border-color: #383838; background: #272727; transform: translateY(-3px); }

        .icon-box {
          background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2);
          color: #22d3ee; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .divider {
          width: 100%; height: 1px;
          background: linear-gradient(to right, transparent, #2e2e2e, transparent);
        }

        .label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.13em;
          text-transform: uppercase; color: #22d3ee;
        }

        .gallery-wrap { cursor: pointer; }
        .gallery-img { transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94); }
        .gallery-wrap:hover .gallery-img { transform: scale(1.05); }

        .star { fill: #f59e0b; color: #f59e0b; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .floating { animation: float 5.5s ease-in-out infinite; }

        @keyframes blink { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        .cursor-blink { animation: blink 1s ease infinite; }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          60% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        .live-dot { animation: pulse-dot 2.2s ease infinite; }

        /* ── LAYOUT CLASSES ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .container-sm { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .lower-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: start;
        }

        /* desktop nav / auth */
        .desktop-nav { display: flex; align-items: center; gap: 32px; }
        .desktop-auth { display: flex; align-items: center; gap: 8px; }
        .mobile-menu-btn { display: none; }

        /* floating chips */
        .float-chip-right {
          position: absolute; top: 16%; right: -58px;
          background: #242424; border: 1px solid #2e2e2e; border-radius: 14px;
          padding: 10px 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .float-chip-left {
          position: absolute; bottom: 18%; left: -64px;
          background: #242424; border: 1px solid #2e2e2e; border-radius: 14px;
          padding: 10px 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          display: flex; align-items: center; gap: 10px;
        }

        /* mobile overlay */
        .mobile-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 200;
          background: rgba(28,28,28,0.97);
          backdrop-filter: blur(20px);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
        }
        .mobile-overlay.open { display: flex; }

        /* ── 1024px ── */
        @media (max-width: 1024px) {
          .float-chip-right { right: -44px; }
          .float-chip-left { left: -48px; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── 768px ── */
        @media (max-width: 768px) {
          .container { padding: 0 20px; }
          .container-sm { padding: 0 20px; }

          .hero-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .features-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .gallery-grid { grid-template-columns: 1fr 1fr; }
          .lower-grid { grid-template-columns: 1fr; gap: 12px; }

          .desktop-nav { display: none; }
          .desktop-auth { display: none; }
          .mobile-menu-btn {
            display: flex; align-items: center; justify-content: center;
          }

          .float-chip-right { display: none; }
          .float-chip-left { display: none; }

          .gallery-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
        }

        /* ── 480px ── */
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr; }
          .gallery-grid { grid-template-columns: 1fr; }

          .hero-btns {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .hero-btns > * {
            justify-content: center !important;
            text-align: center;
          }

          .stats-row {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .stat-item {
            padding-right: 0 !important;
            margin-right: 0 !important;
            border-right: none !important;
            padding-bottom: 16px;
            border-bottom: 1px solid #2e2e2e;
          }
          .stat-item:last-child { border-bottom: none; padding-bottom: 0; }

          .footer-inner {
            flex-direction: column !important;
            text-align: center;
            gap: 12px !important;
          }
        }
      `}</style>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: -200, left: '35%', width: 750, height: 450,
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: 0, width: 500, height: 500,
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.045) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }} />
      </div>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div className={`mobile-overlay${mobileMenuOpen ? ' open' : ''}`}>
        <button
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'absolute', top: 22, right: 24, background: 'none', border: 'none', color: '#6e6a64', cursor: 'pointer', fontSize: 22 }}
        >
          <FiX />
        </button>
        {['Features', 'Gallery', 'Reviews'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: 22, fontWeight: 700, color: '#eeebe5', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}
          >
            {item}
          </a>
        ))}
        <div style={{ width: '40px', height: 1, background: '#2c2c2c' }} />
        <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, color: '#6e6a64', fontWeight: 500 }}>
          Login
        </Link>
        <Link
          to="/signup"
          onClick={() => setMobileMenuOpen(false)}
          className="btn-dark"
          style={{ padding: '13px 32px', borderRadius: 12 }}
        >
          Get Started <FiArrowRight style={{ fontSize: 13 }} />
        </Link>
      </div>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50, transition: 'all 0.3s',
        background: scrolled ? 'rgba(28,28,28,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #262626' : '1px solid transparent',
      }}>
        <div className="container" style={{ height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <Logo />
            <nav className="desktop-nav">
              {['Features', 'Gallery', 'Reviews'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">{item}</a>
              ))}
            </nav>
          </div>

          {/* Desktop auth */}
          <div className="desktop-auth">
            <Link to="/login" className="nav-link" style={{ padding: '8px 14px' }}>Login</Link>
            <Link to="/signup" className="btn-dark" style={{ padding: '9px 20px', borderRadius: 10 }}>Get Started</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: 'none', border: '1px solid #2e2e2e', borderRadius: 10,
              padding: '8px 10px', color: '#eeebe5', cursor: 'pointer', fontSize: 18,
            }}
          >
            <FiMenu />
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 70, zIndex: 1 }}>
        <div className="container" style={{ paddingTop: 64, paddingBottom: 64, width: '100%' }}>
          <div className="hero-grid">

            {/* LEFT */}
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 999,
                border: '1px solid #2e2e2e', background: 'rgba(255,255,255,0.025)',
                fontSize: 12, color: '#6e6a64', fontWeight: 500, marginBottom: 32, letterSpacing: '0.025em',
              }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Modern realtime polling platform
              </div>

              {/* Headline */}
              <h1 className="display" style={{
                fontSize: 'clamp(42px, 6vw, 82px)', lineHeight: 0.93,
                letterSpacing: '-0.02em', color: '#eeebe5', marginBottom: 24, fontWeight: 700,
              }}>
                Polls That
                <span style={{ display: 'block', color: '#5b8ef0', minHeight: '1.08em', fontStyle: 'italic', fontWeight: 400 }}>
                  {text}<span className="cursor-blink" style={{ color: '#5b8ef0' }}>|</span>
                </span>
              </h1>

              {/* Desc */}
              <p style={{ color: '#6e6a64', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.72, maxWidth: 460, marginBottom: 36, fontWeight: 300 }}>
                Votora helps creators, startups, educators, and communities run beautiful live polls with immersive realtime interaction.
              </p>

              {/* Buttons */}
              <div className="hero-btns" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                <button onClick={() => navigate('/signup')} className="btn-dark" style={{ padding: '13px 28px', borderRadius: 12 }}>
                  Start Free <FiArrowRight style={{ fontSize: 13 }} />
                </button>
                <Link to="/login" className="btn-outline" style={{ padding: '13px 28px', borderRadius: 12 }}>Sign In</Link>
              </div>

              {/* Stats */}
              <div className="stats-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                {[['1M+', 'Votes processed'], ['50K+', 'Live sessions'], ['99.9%', 'Uptime reliability']].map(([val, label], i) => (
                  <div
                    key={label}
                    className="stat-item"
                    style={{
                      paddingRight: i < 2 ? 32 : 0,
                      marginRight: i < 2 ? 32 : 0,
                      borderRight: i < 2 ? '1px solid #2e2e2e' : 'none',
                    }}
                  >
                    <h3 className="display" style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#eeebe5' }}>{val}</h3>
                    <p style={{ color: '#3e3a36', fontSize: 12, marginTop: 3 }}>{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — PHONE MOCKUP */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.12 }}
              style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
            >
              {/* Glow */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: 360, height: 580, borderRadius: 60, background: 'radial-gradient(circle, rgba(37,99,235,0.11) 0%, transparent 65%)', filter: 'blur(55px)' }} />
              </div>

              <div className="floating" style={{ position: 'relative', width: 300 }}>
                {/* Phone body */}
                <div style={{
                  borderRadius: 40, overflow: 'hidden', background: '#232323',
                  border: '1px solid #313131',
                  boxShadow: '0 48px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.08) inset',
                }}>
                  {/* Notch */}
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16, paddingBottom: 8 }}>
                    <div style={{ width: 72, height: 4, borderRadius: 99, background: '#313131' }} />
                  </div>

                  {/* Poll UI */}
                  <div style={{ padding: '10px 20px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                      <div>
                        <p style={{ fontSize: 10, color: '#4a4540', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>Live Poll</p>
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#eeebe5' }}>Favourite Language?</h2>
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <HiOutlineChartBar style={{ color: '#5b8ef0', fontSize: 15 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {polls.map((option, i) => {
                        const isTop = i === 0;
                        return (
                          <motion.div key={option.name} layout style={{
                            borderRadius: 14, padding: '12px 14px',
                            background: isTop ? 'rgba(37,99,235,0.07)' : 'rgba(255,255,255,0.02)',
                            border: isTop ? '1px solid rgba(37,99,235,0.2)' : '1px solid #2c2c2c',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: isTop ? '#eeebe5' : '#4e4a46' }}>{option.name}</p>
                              <p style={{ fontSize: 11, fontWeight: 700, color: isTop ? '#5b8ef0' : '#363230' }}>{option.votes}%</p>
                            </div>
                            <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                              <motion.div
                                animate={{ width: `${option.votes}%` }}
                                transition={{ duration: 0.8 }}
                                style={{ height: '100%', borderRadius: 99, background: isTop ? 'linear-gradient(90deg,#1a56db,#5b8ef0)' : 'rgba(255,255,255,0.08)' }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Live badge */}
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 12, border: '1px solid #2c2c2c', background: 'rgba(255,255,255,0.015)' }}>
                      <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      <span style={{ fontSize: 10, color: '#4a4540', fontWeight: 500 }}>Results updating live</span>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="float-chip-right"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.4 }}
                >
                  <p style={{ fontSize: 10, color: '#4a4540', fontWeight: 600, marginBottom: 3 }}>Live Votes</p>
                  <p className="display" style={{ fontSize: 20, fontWeight: 700, color: '#eeebe5', letterSpacing: '-0.03em' }}>1,284</p>
                </motion.div>

             
                <motion.div
                  className="float-chip-left"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1.2 }}
                >
                  <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 11, color: '#eeebe5', fontWeight: 600 }}>Session Active</p>
                    <p style={{ fontSize: 10, color: '#4a4540', marginTop: 2 }}>48 participants</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, paddingBottom: 96 }}>
        <div className="container">
          <div className="divider" style={{ marginBottom: 72 }} />
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="label" style={{ marginBottom: 16 }}>Core features</p>
            <h2 className="display" style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#eeebe5', marginBottom: 16, lineHeight: 1.05 }}>
              Built for modern live engagement
            </h2>
            <p style={{ color: '#6e6a64', maxWidth: 460, margin: '0 auto', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: 1.72, fontWeight: 300 }}>
              Powerful realtime tools designed for classrooms, creators, communities, and modern events.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="card"
                style={{ padding: '24px 20px' }}
              >
                <div className="icon-box" style={{ width: 44, height: 44, fontSize: 16, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#eeebe5', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#6e6a64', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

     
      <section id="gallery" style={{ position: 'relative', zIndex: 1, paddingBottom: 96 }}>
        <div className="container">
          <div className="gallery-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p className="label" style={{ marginBottom: 14 }}>Real experiences</p>
              <h2 className="display" style={{ fontSize: 'clamp(26px, 4vw, 54px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.97, color: '#eeebe5' }}>
                Polling that feels<br />
                <em style={{ fontWeight: 400, color: '#5b8ef0' }}>natural & immersive</em>
              </h2>
            </div>
            <p style={{ maxWidth: 360, color: '#6e6a64', lineHeight: 1.72, fontSize: 'clamp(13px, 1.5vw, 15px)', fontWeight: 300 }}>
              Designed for educators, creators, startups, and communities who want modern audience interaction without complexity.
            </p>
          </div>
          <div className="gallery-grid">
            {gallery.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="gallery-wrap"
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, border: '1px solid #2c2c2c' }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="gallery-img"
                  style={{ width: '100%', height: 'clamp(220px, 28vw, 380px)', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '22px 20px' }}>
                  <h3 className="display" style={{ fontSize: 'clamp(16px, 2vw, 21px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, maxWidth: 260 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOWER SECTION ── */}
      <section style={{ position: 'relative', zIndex: 1, paddingBottom: 96 }}>
        <div className="container">
          <div className="lower-grid">
            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <FiShield />, title: 'Secure Infrastructure', desc: 'Protected realtime architecture built for reliability.' },
                { icon: <FiClock />, title: 'Instant Sync', desc: 'Every interaction updates instantly without refresh.' },
                { icon: <FiLayers />, title: 'Multiple Poll Types', desc: 'MCQs, ratings, quizzes and audience feedback.' },
                { icon: <FiCheckCircle />, title: 'Minimal Experience', desc: 'Modern interface focused on clarity and speed.' },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="card"
                  style={{ padding: '18px 20px', display: 'flex', gap: 15, cursor: 'default' }}
                >
                  <div className="icon-box" style={{ minWidth: 40, height: 40, fontSize: 14, marginTop: 2 }}>{f.icon}</div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#eeebe5', marginBottom: 5 }}>{f.title}</h3>
                    <p style={{ color: '#6e6a64', fontSize: 13, lineHeight: 1.62 }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

           
            <div id="reviews" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {testimonials.map((feedback, index) => (
                <motion.div
                  key={feedback.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="card"
                  style={{ padding: '24px 22px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 16 }}>
                    {[...Array(5)].map((_, j) => <FiStar key={j} className="star" style={{ fontSize: 12 }} />)}
                  </div>
                  <p className="display" style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: 1.72, color: '#8a8480', marginBottom: 20, fontWeight: 400, fontStyle: 'italic' }}>
                    "{feedback.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(37,99,235,0.28), rgba(37,99,235,0.08))',
                      border: '1px solid rgba(37,99,235,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: '#5b8ef0',
                    }}>
                      {feedback.name[0]}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: '#eeebe5' }}>{feedback.name}</h4>
                      <p style={{ color: '#3e3a36', fontSize: 12, marginTop: 2 }}>{feedback.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      
      <section style={{ position: 'relative', zIndex: 1, paddingBottom: 96 }}>
        <div className="container-sm">
          <div style={{
            position: 'relative', borderRadius: 32, border: '1px solid #2e2e2e',
            background: '#212121', padding: 'clamp(48px, 7vw, 80px) clamp(24px, 5vw, 56px)',
            overflow: 'hidden', textAlign: 'center',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 220, height: 1, background: 'linear-gradient(to right, transparent, #5b8ef0, transparent)' }} />
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 560, height: 280, background: 'radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <p className="label" style={{ marginBottom: 20 }}>Get started today</p>
              <h2 className="display" style={{ fontSize: 'clamp(28px, 5vw, 58px)', fontWeight: 700, letterSpacing: '-0.04em', color: '#eeebe5', marginBottom: 20, lineHeight: 1.02 }}>
                Start your first live<br />poll today
              </h2>
              <p style={{ color: '#6e6a64', maxWidth: 440, margin: '0 auto 36px', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: 1.72, fontWeight: 300 }}>
                Create immersive realtime polls for your audience, classroom, startup, or community in minutes.
              </p>
              <button onClick={() => navigate('/signup')} className="btn-dark" style={{ padding: '14px 34px', borderRadius: 12 }}>
                Create Poll <FiArrowRight style={{ fontSize: 13 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #262626', position: 'relative', zIndex: 1 }}>
        <div className="container-sm">
          <div className="footer-inner" style={{ padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 22, height: 22, borderRadius: 7, background: '#2a2a2a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: '#eeebe5' }}>V</span>
                <div style={{ position: 'absolute', bottom: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#5b8ef0' }} />
              </div>
              <span style={{ fontSize: 13, color: '#3e3a36', fontWeight: 500 }}>Votora</span>
            </div>
            <p style={{ fontSize: 12, color: '#303030' }}>© 2026 Votora. Built for modern realtime engagement.</p>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {['Privacy', 'Terms', 'Status'].map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{ fontSize: 12, color: '#3e3a36', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.target.style.color = '#6e6a64')}
                  onMouseLeave={(e) => (e.target.style.color = '#3e3a36')}
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
