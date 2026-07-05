import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiTrash2, FiArrowLeft, FiArrowRight, FiCheckCircle,
  FiShield, FiClock, FiZap, FiLock, FiKey, FiGlobe,
  FiShuffle, FiHash, FiEye, FiChevronUp, FiChevronDown,
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import notify from '../../../utils/notify';
import { createPoll } from '../pollSlice';
import {
  PremiumBackground, SecurityScore, PremiumToggle, SectionHeader, calcSecurityScore,
} from '../../../components/ui/PremiumUI';
import SectionGuide from '../../../components/ui/SectionGuide';

let questionIdCounter = 0;

const emptyQuestion = () => ({
  id: `q-${Date.now()}-${++questionIdCounter}`,
  question: '',
  options: ['', ''],
  required: true,
  correctOption: null,
});

const STEPS = [
  { id: 0, label: 'Details', icon: FiZap },
  { id: 1, label: 'Questions', icon: FiCheckCircle },
  { id: 2, label: 'Security', icon: FiShield },
];

function StepBar({ current, onGo }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-10 overflow-x-auto pb-2">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => onGo(i)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                active
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : done
                    ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400/80 hover:bg-cyan-500/10'
                    : 'border-white/[0.06] bg-black/20 text-gray-600 hover:text-gray-400'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                active ? 'bg-cyan-500 text-white' : done ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5'
              }`}>
                {done ? <FiCheckCircle size={14} /> : <Icon size={14} />}
              </div>
              <span className="text-xs font-semibold hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-6 sm:w-10 h-px mx-1 ${done ? 'bg-cyan-500/40' : 'bg-white/5'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const CreatePollPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.polls);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    title: '',
    description: '',
    isAnonymous: true,
    requiresAuth: false,
    isQuiz: false,
    cheatProtection: false,
    accessCode: '',
    allowedDomains: '',
    shuffleOptions: false,
    maxResponses: '',
    timeLimitSystem: 'none',
    expiresAt: '',
    timerDuration: '',
    questions: [emptyQuestion()],
  });

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const securityScore = calcSecurityScore(form);

  const updateQuestion = (qIdx, key, val) => {
    const qs = [...form.questions];
    qs[qIdx] = { ...qs[qIdx], [key]: val };
    updateForm('questions', qs);
  };
  const updateOption = (qIdx, oIdx, val) => {
    const qs = [...form.questions];
    const opts = [...qs[qIdx].options];
    opts[oIdx] = val;
    qs[qIdx] = { ...qs[qIdx], options: opts };
    updateForm('questions', qs);
  };
  const addOption = (qIdx) => updateQuestion(qIdx, 'options', [...form.questions[qIdx].options, '']);
  const removeOption = (qIdx, oIdx) => updateQuestion(qIdx, 'options', form.questions[qIdx].options.filter((_, i) => i !== oIdx));
  const addQuestion = () => updateForm('questions', [...form.questions, emptyQuestion()]);
  const removeQuestion = (qIdx) => updateForm('questions', form.questions.filter((_, i) => i !== qIdx));
  const moveQuestion = (qIdx, direction) => {
    const target = qIdx + direction;
    if (target < 0 || target >= form.questions.length) return;
    const qs = [...form.questions];
    [qs[qIdx], qs[target]] = [qs[target], qs[qIdx]];
    updateForm('questions', qs);
  };

  const validateStep = () => {
    if (step === 0 && !form.title.trim()) { notify.error('Poll title is required'); return false; }
    if (step === 1) {
      const valid = form.questions.every((q) => q.question.trim() && q.options.filter(Boolean).length >= 2);
      if (!valid) { notify.error('Each question needs text and at least 2 options'); return false; }
    }
    if (step === 2 && form.accessCode.trim() && form.accessCode.trim().length < 4) {
      notify.error('Access PIN must be at least 4 characters');
      return false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 2)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { notify.error('Poll title required'); return; }
    const validQuestions = form.questions.every((q) => q.question.trim() && q.options.filter(Boolean).length >= 2);
    if (!validQuestions) { notify.error('Each question needs text and at least 2 options'); setStep(1); return; }
    if (form.accessCode.trim() && form.accessCode.trim().length < 4) {
      notify.error('Access PIN must be at least 4 characters');
      setStep(2);
      return;
    }

    const payload = {
      ...form,
      accessCode: form.accessCode.trim() || undefined,
      allowedDomains: form.allowedDomains.split(',').map((d) => d.trim()).filter(Boolean),
      maxResponses: form.maxResponses ? Number(form.maxResponses) : null,
      expiresAt: form.timeLimitSystem === 'expiry' && form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      timerDuration: form.timeLimitSystem === 'timer' && form.timerDuration ? Number(form.timerDuration) : null,
      questions: form.questions.map(({ id: _id, ...q }) => ({
        ...q,
        options: q.options.filter(Boolean),
      })),
    };
    delete payload.allowedDomainsString;

    const res = await dispatch(createPoll(payload));
    if (createPoll.fulfilled.match(res)) {
      notify.success('Poll published successfully!');
      navigate('/dashboard');
    } else {
      notify.error(res.payload || 'Failed to create poll');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative min-h-[calc(100vh-4rem)] -m-6 lg:-m-10">
      <PremiumBackground />

      {/* Sticky header */}
      <div className="sticky top-0 z-40 premium-glass border-b border-white/[0.06] mx-0 px-6 lg:px-10 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <FiArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <HiOutlineSparkles className="text-cyan-400" />
              <span className="text-sm font-bold text-gray-200">Create Poll</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button type="button" onClick={prevStep} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 border border-white/10 hover:bg-white/5 transition-all">
                Back
              </button>
            )}
            {step < 2 ? (
              <button type="button" onClick={nextStep} className="premium-btn">
                Continue <FiArrowRight size={14} />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="premium-btn">
                {loading ? 'Publishing…' : 'Publish Poll'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-6">
        <SectionGuide page="create" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <SectionHeader
          eyebrow="Votora Studio"
          title={step === 0 ? 'Define your poll' : step === 1 ? 'Craft questions' : 'Lock it down'}
          subtitle={
            step === 0 ? 'Set the title, description, and timing for your live session.'
              : step === 1 ? 'Build engaging questions with multiple choice options.'
                : 'Configure privacy, access control, and anti-fraud protections.'
          }
        />

        <StepBar current={step} onGo={setStep} />

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {step === 0 && (
                <div className="premium-glass-strong p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Poll Title *</label>
                    <input value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="e.g. Q4 Product Roadmap Vote" className="premium-input text-base" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Description</label>
                    <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={3} placeholder="Give participants context…" className="premium-input resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">Time Control</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['none', 'expiry', 'timer'].map((sys) => (
                        <button key={sys} type="button" onClick={() => updateForm('timeLimitSystem', sys)}
                          className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all ${
                            form.timeLimitSystem === sys
                              ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                              : 'border-white/[0.06] text-gray-500 hover:border-white/10'
                          }`}>
                          {sys === 'none' ? 'Open' : sys === 'expiry' ? 'Auto-Close' : 'Live Timer'}
                        </button>
                      ))}
                    </div>
                    {form.timeLimitSystem === 'expiry' && (
                      <input type="datetime-local" value={form.expiresAt} onChange={(e) => updateForm('expiresAt', e.target.value)}
                        className="premium-input mt-3 [color-scheme:dark]" />
                    )}
                    {form.timeLimitSystem === 'timer' && (
                      <input type="number" min="1" max="1440" value={form.timerDuration} onChange={(e) => updateForm('timerDuration', e.target.value)}
                        placeholder="Duration in minutes" className="premium-input mt-3" />
                    )}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  {form.questions.map((q, qIdx) => (
                    <div key={q.id} className="premium-glass-strong overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/[0.06] flex justify-between items-center bg-black/20">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Question {qIdx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveQuestion(qIdx, -1)} disabled={qIdx === 0}
                            className="text-gray-600 hover:text-cyan-400 p-1 disabled:opacity-30" aria-label="Move up">
                            <FiChevronUp size={14} />
                          </button>
                          <button type="button" onClick={() => moveQuestion(qIdx, 1)} disabled={qIdx === form.questions.length - 1}
                            className="text-gray-600 hover:text-cyan-400 p-1 disabled:opacity-30" aria-label="Move down">
                            <FiChevronDown size={14} />
                          </button>
                          {form.questions.length > 1 && (
                            <button type="button" onClick={() => removeQuestion(qIdx)} className="text-gray-600 hover:text-red-400 p-1 ml-1"><FiTrash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <input value={q.question} onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                          placeholder="What would you like to ask?" className="premium-input" />
                        {q.options.map((opt, oIdx) => (
                          <div key={`${q.id}-opt-${oIdx}`} className="flex gap-2 items-center">
                            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500">{String.fromCharCode(65 + oIdx)}</span>
                            <input value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} className="premium-input flex-1 py-2.5" />
                            {form.isQuiz && (
                              <button type="button" onClick={() => updateQuestion(qIdx, 'correctOption', oIdx)}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center ${q.correctOption === oIdx ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-600'}`}>
                                <FiCheckCircle size={14} />
                              </button>
                            )}
                            {q.options.length > 2 && (
                              <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="text-gray-700 hover:text-red-400"><FiTrash2 size={12} /></button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addOption(qIdx)} className="text-xs font-bold text-cyan-400 flex items-center gap-1 ml-10"><FiPlus size={12} /> Add option</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addQuestion} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-sm font-semibold">
                    + Add another question
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="premium-glass-strong p-6 sm:p-8 space-y-4">
                  <PremiumToggle label="Require Login" desc="Only authenticated users can vote" value={form.requiresAuth} onClick={() => updateForm('requiresAuth', !form.requiresAuth)} icon={FiShield} />
                  <PremiumToggle label="Anonymous Responses" desc="Hide voter identity from results" value={form.isAnonymous} onClick={() => updateForm('isAnonymous', !form.isAnonymous)} icon={FiEye} />
                  <PremiumToggle label="Quiz Mode" desc="Score answers against correct options" value={form.isQuiz} onClick={() => { updateForm('isQuiz', !form.isQuiz); if (form.isQuiz) updateForm('cheatProtection', false); }} icon={FiCheckCircle} />
                  {form.isQuiz && (
                    <PremiumToggle label="Anti-Cheat Shield" desc="Auto-submit when tab is switched" value={form.cheatProtection} onClick={() => updateForm('cheatProtection', !form.cheatProtection)} icon={FiLock} premium />
                  )}
                  <PremiumToggle label="Shuffle Options" desc="Randomize answer order per participant" value={form.shuffleOptions} onClick={() => updateForm('shuffleOptions', !form.shuffleOptions)} icon={FiShuffle} premium />

                  <div className="pt-4 border-t border-white/[0.06] space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5"><FiKey size={10} /> Access PIN</label>
                      <input value={form.accessCode} onChange={(e) => updateForm('accessCode', e.target.value)} placeholder="Optional 4–12 character code" maxLength={12} className="premium-input" />
                      <p className="text-[10px] text-gray-600 mt-1.5">Participants must enter this PIN before voting</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5"><FiGlobe size={10} /> Allowed Email Domains</label>
                      <input value={form.allowedDomains} onChange={(e) => updateForm('allowedDomains', e.target.value)} placeholder="company.com, university.edu" className="premium-input" />
                      <p className="text-[10px] text-gray-600 mt-1.5">Comma-separated. Requires login to enforce.</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5"><FiHash size={10} /> Response Cap</label>
                      <input type="number" min="1" value={form.maxResponses} onChange={(e) => updateForm('maxResponses', e.target.value)} placeholder="Unlimited" className="premium-input" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <SecurityScore score={securityScore} />
            <div className="premium-glass p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Protections</p>
              {[
                { on: form.requiresAuth, label: 'Auth required' },
                { on: form.accessCode?.trim(), label: 'PIN protected' },
                { on: form.cheatProtection, label: 'Anti-cheat' },
                { on: form.shuffleOptions, label: 'Option shuffle' },
                { on: form.maxResponses, label: 'Response cap' },
                { on: form.timeLimitSystem !== 'none', label: 'Time limited' },
              ].filter((p) => p.on).map((p) => (
                <div key={p.label} className="flex items-center gap-2 text-xs text-cyan-300/90">
                  <FiCheckCircle size={12} className="text-cyan-500" /> {p.label}
                </div>
              ))}
              {!form.requiresAuth && !form.accessCode && !form.cheatProtection && (
                <p className="text-xs text-gray-600">Enable security options in step 3</p>
              )}
            </div>
            <div className="premium-glass p-5">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                <span>Completion</span>
                <span className="text-cyan-400">{Math.round(((form.title ? 1 : 0) + form.questions.filter((q) => q.question.trim()).length) / (1 + form.questions.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(((form.title ? 1 : 0) + form.questions.filter((q) => q.question.trim()).length) / (1 + form.questions.length) * 100)}%` }} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
};

export default CreatePollPage;
