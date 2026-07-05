import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import usePollSocket from '../../../hooks/usePollSocket';
import Spinner from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';
import notify from '../../../utils/notify';
import Logo from '../../../components/ui/Logo';
import { PremiumBackground } from '../../../components/ui/PremiumUI';
import SectionGuide from '../../../components/ui/SectionGuide';

const PublicPollPage = () => {
  const { pollCode } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState(0);
  const [isCheatSubmitted, setIsCheatSubmitted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [accessPin, setAccessPin] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [activeTimerEnd, setActiveTimerEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

  const generatePayload = useCallback(() => {
    if (!poll?.questions) return [];
    return poll.questions.map((_, qIdx) => ({
      questionIndex: qIdx,
      selectedOption: answers[qIdx] || null,
    }));
  }, [poll, answers]);

  const handleAutoSubmit = useCallback(async (isCheat = false) => {
    if (autoSubmitTriggered || !poll?._id) return;
    setAutoSubmitTriggered(true);

    const payload = generatePayload();
    try {
      setSubmitting(true);
      const res = await api.post(`/responses/${poll._id}`, { answers: payload, isAutoSubmitted: true });
      if (res.data.quizResults) setQuizResults(res.data.quizResults);
      setSubmitted(true);

      if (isCheat) {
        notify.error('Quiz auto-submitted because you left the page!', { duration: 6000 });
      } else {
        notify.error("Time's up! Your response was auto-submitted.", { duration: 6000 });
      }
    } catch (err) {
      console.error('Auto-submit failed', err);
    } finally {
      setSubmitting(false);
    }
  }, [autoSubmitTriggered, poll, generatePayload]);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await api.get(`/polls/public/${pollCode}`);
        const p = res.data.poll;
        if (p.isPublished) {
          navigate(`/poll/${pollCode}/results`);
          return;
        }
        if (p.locked || (p.requiresAccessCode && !p.questions?.length)) {
          setPoll(p);
          setLocked(true);
          return;
        }
        setPoll(p);
        setLocked(false);
        if (p.timeLimitSystem === 'timer' && p.timerEndTime) {
          const end = new Date(p.timerEndTime);
          if (end > new Date()) setActiveTimerEnd(end);
        } else if (p.timeLimitSystem === 'expiry' && p.expiresAt) {
          const end = new Date(p.expiresAt);
          if (end > new Date()) setActiveTimerEnd(end);
        }
      } catch (err) {
        if (err.response?.status === 410) setExpired(true);
        else {
          console.error('Poll fetch error:', err);
          setError(err.response?.data?.message || 'Poll not found');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [pollCode, navigate]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!accessPin.trim()) return notify.error('Enter the access PIN');
    setUnlocking(true);
    try {
      const res = await api.post(`/polls/public/${pollCode}/unlock`, { accessCode: accessPin });
      setPoll(res.data.poll);
      setLocked(false);
      const p = res.data.poll;
      if (p.timeLimitSystem === 'timer' && p.timerEndTime) {
        const end = new Date(p.timerEndTime);
        if (end > new Date()) setActiveTimerEnd(end);
      } else if (p.timeLimitSystem === 'expiry' && p.expiresAt) {
        const end = new Date(p.expiresAt);
        if (end > new Date()) setActiveTimerEnd(end);
      }
      notify.success('Access granted');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Invalid PIN');
    } finally {
      setUnlocking(false);
    }
  };

  usePollSocket(poll?._id, {
    onParticipantCount: ({ count }) => setParticipants(count),
    onPollExpired: () => setExpired(true),
    onPollPublished: () => navigate(`/poll/${pollCode}/results`),
    onTimerStarted: ({ endTime }) => {
      const end = new Date(endTime);
      if (end > new Date()) {
        setActiveTimerEnd(end);
        setPoll((p) => (p ? { ...p, timerEndTime: endTime } : p));
        notify.success('The session has started!');
      }
    },
  }, { enabled: Boolean(poll?._id) && !locked });

  useEffect(() => {
    if (!activeTimerEnd) return;
    const interval = setInterval(() => {
      const remaining = Math.floor((activeTimerEnd - new Date()) / 1000);
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
        setActiveTimerEnd(null);
        handleAutoSubmit(false);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerEnd, handleAutoSubmit]);


  useEffect(() => {
    if (!poll || !poll.cheatProtection || submitted || submitting) return;

    const triggerCheatSubmit = () => {
      if (!submitted && !submitting) {
        setIsCheatSubmitted(true);
        handleAutoSubmit(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') triggerCheatSubmit();
    };

    const handleBlur = () => triggerCheatSubmit();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [poll, submitted, submitting, handleAutoSubmit]);

  const handleSelect = (qIdx, option) =>
    setAnswers((a) => ({ ...a, [qIdx]: option }));

  const handleSubmit = async () => {
    const missing = poll.questions
      .map((q, i) => ({ ...q, index: i }))
      .filter((q) => q.required && !answers[q.index]);

    if (missing.length) {
      notify.error(`Please answer: "${missing[0].question}"`);
      return;
    }

    const payload = generatePayload();

    try {
      setSubmitting(true);
      const res = await api.post(`/responses/${poll._id}`, { answers: payload });

      if (res.data.quizResults) setQuizResults(res.data.quizResults);
      setSubmitted(true);

      notify.success('Response submitted!');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  if (locked && poll)
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 relative overflow-hidden">
        <PremiumBackground />
        <form onSubmit={handleUnlock} className="premium-glass-strong p-8 sm:p-10 max-w-md w-full text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 text-3xl">🔐</div>
          <h2 className="text-2xl font-black text-white mb-2">{poll.title}</h2>
          <p className="text-gray-500 text-sm mb-8">This poll is PIN-protected. Enter the access code from your host to continue.</p>
          <input
            value={accessPin}
            onChange={(e) => setAccessPin(e.target.value)}
            placeholder="Enter access PIN"
            maxLength={12}
            className="premium-input text-center text-lg tracking-widest mb-4"
            autoFocus
          />
          <button type="submit" disabled={unlocking} className="premium-btn w-full">
            {unlocking ? 'Verifying…' : 'Unlock Poll'}
          </button>
        </form>
      </div>
    );

  if (!loading && poll && poll.isQuiz && !user)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="card text-center max-w-md w-full">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Login Required
          </h2>
          <p className="text-gray-400 mb-6">
            You must be signed in to participate in this quiz.
          </p>
          <Link to={`/login?redirect=/poll/${pollCode}`}>
            <Button className="w-full">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  
  if (!loading && poll && poll.timeLimitSystem === 'timer' && !activeTimerEnd)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="card text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-pulse" />
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Waiting for Host
          </h2>
          <p className="text-gray-400 mb-6">
            The poll creator has not started the timer yet. This page will update automatically once the session begins.
          </p>
          <div className="flex items-center justify-center gap-3">
             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
          </div>
          {participants > 0 && (
             <p className="mt-6 text-xs text-gray-500">{participants} people are waiting...</p>
          )}
        </div>
      </div>
    );

  if (expired)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="card text-center max-w-md w-full">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Poll Expired
          </h2>
          <p className="text-gray-400">
            This poll is no longer accepting responses.
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="card text-center max-w-md w-full">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Poll Not Found
          </h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );

  if (submitted) {
    if (poll.isQuiz && quizResults) {
      let score = 0;
      poll.questions.forEach((q, i) => {
        if (answers[i] === q.options[quizResults[i]]) score++;
      });

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
          <div className="card text-center max-w-md w-full">
            <div className="text-5xl mb-6">{isCheatSubmitted ? '🚫' : '🏆'}</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isCheatSubmitted ? 'Auto-Submitted' : 'Quiz Completed!'}
            </h2>
            <p className="text-gray-400 mb-8">
              {isCheatSubmitted
                ? 'Your quiz was auto-submitted when you left the page.'
                : 'You\'ve successfully submitted your responses.'}
            </p>

            <div className="bg-[#0f0f0f] rounded-2xl p-8 border border-white/[0.06] mb-8">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Your Score</p>
              <h3 className="text-6xl font-black text-cyan-400">
                {score}<span className="text-2xl text-gray-600 ml-2">/ {poll.questions.length}</span>
              </h3>
            </div>

            <div className="flex gap-3">
              <Link to="/dashboard" className="flex-1">
                <Button className="w-full bg-[#1a1a1a] hover:bg-white/5 text-white border border-white/10">Go Home</Button>
              </Link>
              <Link to={`/poll/${pollCode}/results`} className="flex-1">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20">View Results</Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="card text-center max-w-md w-full">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-400 mb-8">
            Your response has been recorded successfully.
          </p>
          <Link to={`/poll/${pollCode}/results`}>
            <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20">
              View Poll Results
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      <PremiumBackground />

      {}
      <header className="border-b border-surface-border py-4 px-6 relative z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono font-bold text-sm animate-pulse">
                ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
            {participants > 0 && (
              <span className="text-xs text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                {participants} viewing
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              {poll.title}
            </h1>
            {poll.description && (
              <p className="text-gray-400">{poll.description}</p>
            )}
            <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
              {poll.isAnonymous && <span>🔓 Anonymous</span>}
              <span>
                {poll.questions?.length} question
                {poll.questions?.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <SectionGuide page="public-poll" defaultOpen={false} />

          {}
          <div className="space-y-6">
            {poll.questions?.map((q, qIdx) => (
              <motion.div
                key={qIdx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex justify-between mb-4">
                  <h3 className="text-white font-semibold">
                    <span className="text-gray-400 mr-2">{qIdx + 1}.</span>
                    {q.question}
                  </h3>
                  {q.required && (
                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Required</span>
                  )}
                </div>

                <div className="space-y-2">
                  {q.options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(qIdx, option)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 group ${answers[qIdx] === option
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                          : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all ${answers[qIdx] === option
                            ? 'bg-cyan-500 border-cyan-500 scale-110 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                            : 'border-gray-500'
                          }`}
                      />
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Submit */}
          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              loading={submitting}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
              size="lg"
            >
              Submit Response
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PublicPollPage;