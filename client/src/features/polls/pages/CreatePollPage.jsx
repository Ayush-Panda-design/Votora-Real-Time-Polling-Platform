import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPoll } from '../pollSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiTrash2, FiArrowLeft, FiCheckCircle,
  FiShield, FiClock, FiUsers, FiZap, FiInfo,
  FiChevronRight, FiLock
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';



const emptyQuestion = () => ({
  question: '',
  options: ['', ''],
  required: true,
  correctOption: null,
});

const STEPS = ['Poll Details', 'Questions', 'Settings'];



function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-4 no-scrollbar">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                done ? 'bg-cyan-500 text-white' :
                active ? 'bg-cyan-500/15 border-2 border-cyan-500 text-cyan-400' :
                'bg-[#1a1a1a] border border-white/10 text-gray-600'
              }`}>
                {done ? <FiCheckCircle className="text-[13px]" /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${
                active ? 'text-gray-200' : done ? 'text-cyan-400' : 'text-gray-600'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-px mx-2 mb-5 transition-colors duration-300 ${
                done ? 'bg-cyan-500/40' : 'bg-white/5'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const Toggle = ({ label, desc, value, onClick, icon: Icon }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
      value
        ? 'border-cyan-500/30 bg-cyan-500/[0.04]'
        : 'border-white/5 bg-[#151515] hover:bg-[#1a1a1a]'
    }`}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] ${
          value ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/5 text-gray-500'
        }`}>
          <Icon />
        </div>
      )}
      <div>
        <p className={`text-[13px] font-semibold ${value ? 'text-gray-200' : 'text-gray-500'}`}>{label}</p>
        <p className="text-[11px] text-gray-600 mt-0.5">{desc}</p>
      </div>
    </div>
    <button type="button" className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0 ${
      value ? 'bg-cyan-500' : 'bg-[#333]'
    }`}>
      <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
        value ? 'left-[22px]' : 'left-[3px]'
      }`} />
    </button>
  </div>
);

function InfoCard({ icon: Icon, title, desc, accent = false }) {
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${
      accent ? 'border-cyan-500/20 bg-cyan-500/[0.03]' : 'border-white/5 bg-[#111]'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[13px] ${
        accent ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/5 text-gray-600'
      }`}>
        <Icon />
      </div>
      <div>
        <p className={`text-[12px] font-semibold mb-0.5 ${accent ? 'text-cyan-200' : 'text-gray-500'}`}>{title}</p>
        <p className="text-[11px] text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, badge }) {
  return (
    <div className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-gray-200">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold uppercase tracking-wide">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[12px] text-gray-600 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
          {required && <span className="text-cyan-500 ml-1">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-600 italic">{hint}</span>}
      </div>
      {children}
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
    timeLimitSystem: 'none', // 'none', 'expiry', 'timer'
    expiresAt: '',
    timerDuration: '',
    questions: [emptyQuestion()],
  });

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Poll title required'); return; }

    const payload = {
      ...form,
      expiresAt: form.timeLimitSystem === 'expiry' && form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      timerDuration: form.timeLimitSystem === 'timer' && form.timerDuration ? Number(form.timerDuration) : null,
      questions: form.questions.map(q => ({ ...q, options: q.options.filter(Boolean) }))
    };

    const res = await dispatch(createPoll(payload));
    if (createPoll.fulfilled.match(res)) {
      toast.success('Poll created!');
      navigate('/dashboard');
    }
  };

  const filledTitle = form.title.trim() ? 1 : 0;
  const filledQuestions = form.questions.filter(q => q.question.trim() && q.options.filter(Boolean).length >= 2).length;
  const completionPct = Math.round(((filledTitle + filledQuestions) / (1 + form.questions.length)) * 100);

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#0f0f0f] text-white">
      {/* */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-1/4 w-[600px] h-[300px] bg-cyan-500/[0.03] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/dashboard')} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
              <FiArrowLeft className="text-[13px]" />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <HiOutlineSparkles className="text-cyan-400 text-[14px]" />
              <span className="text-[13px] font-semibold text-gray-200">Create Poll</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-[13px] font-bold text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Poll'}
          </button>
        </div>
      </div>

      {/*  */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 bg-[#1a1a1a] text-[10px] text-gray-500 mb-4 font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Votora Dashboard
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-gray-100">Build your live poll</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-lg">Configure your poll details, add questions, and set your privacy preferences.</p>
        </div>

        <StepIndicator current={step} />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* */}
          <div className="flex-1 space-y-6">

            <SectionCard title="Poll Details" subtitle="Setting the foundation">
              <div className="space-y-5">
                <Field label="Poll Title" required hint="Shown to all participants">
                  <input
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="e.g. Team lunch preferences"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-[14px] text-gray-200 placeholder:text-gray-700 transition-all"
                  />
                </Field>

                <Field label="Description" hint="Optional">
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    placeholder="Provide more context for your participants…"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-[14px] text-gray-200 placeholder:text-gray-700 resize-none transition-all"
                  />
                </Field>

                <div className="space-y-4">
                  <Field label="Time Limit System" hint="Choose how to restrict voting time">
                    <div className="grid grid-cols-3 gap-2">
                      {['none', 'expiry', 'timer'].map(sys => (
                        <button
                          key={sys}
                          type="button"
                          onClick={() => updateForm('timeLimitSystem', sys)}
                          className={`py-2 px-3 rounded-xl border text-[13px] font-medium transition-all ${
                            form.timeLimitSystem === sys
                              ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                              : 'border-white/5 bg-[#1a1a1a] text-gray-500 hover:bg-white/5'
                          }`}
                        >
                          {sys === 'none' ? 'None' : sys === 'expiry' ? 'Auto Expiry' : 'Manual Timer'}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <AnimatePresence>
                    {form.timeLimitSystem === 'expiry' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <Field label="Expiry Date & Time" hint="Poll will auto-close at this time">
                          <div className="relative">
                            <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-[13px] pointer-events-none" />
                            <input
                              type="datetime-local"
                              value={form.expiresAt}
                              onChange={(e) => updateForm('expiresAt', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-[14px] text-gray-400 transition-all [color-scheme:dark]"
                            />
                          </div>
                        </Field>
                      </motion.div>
                    )}

                    {form.timeLimitSystem === 'timer' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <Field label="Timer Duration (Minutes)" hint="You will start this timer from the Analytics page">
                          <div className="relative">
                            <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-[13px] pointer-events-none" />
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={form.timerDuration}
                              onChange={(e) => updateForm('timerDuration', e.target.value)}
                              placeholder="e.g. 10"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-[14px] text-gray-200 placeholder:text-gray-700 transition-all"
                            />
                          </div>
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SectionCard>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[15px] font-bold text-gray-200">Questions</h2>
                <span className="text-[11px] text-gray-600 font-medium tracking-wide uppercase">{form.questions.length} Question(s)</span>
              </div>

              <AnimatePresence mode="popLayout">
                {form.questions.map((q, qIdx) => (
                  <motion.div
                    key={qIdx}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden"
                  >
                    <div className="px-5 py-3 border-b border-white/5 bg-[#1a1a1a]/50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-cyan-500/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-cyan-500">{qIdx + 1}</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Question</span>
                      </div>
                      {form.questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(qIdx)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-gray-600 hover:text-red-400 transition-all">
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="p-5 space-y-4">
                      <input
                        value={q.question}
                        onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                        placeholder="Enter your question here..."
                        className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/5 focus:border-cyan-500/40 outline-none text-[14px] transition-all"
                      />

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2">
                            <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <input
                              value={opt}
                              onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                              placeholder={`Option ${oIdx + 1}`}
                              className={`flex-1 px-4 py-2 rounded-xl bg-[#0a0a0a] border outline-none text-[13px] transition-all ${
                                form.isQuiz && q.correctOption === oIdx
                                  ? 'border-cyan-500/50 ring-1 ring-cyan-500/20'
                                  : 'border-white/5 focus:border-cyan-500/40'
                              }`}
                            />
                            {form.isQuiz && (
                              <button
                                type="button"
                                onClick={() => updateQuestion(qIdx, 'correctOption', oIdx)}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                  q.correctOption === oIdx
                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                    : 'bg-white/5 text-gray-600 hover:text-gray-400'
                                }`}
                                title="Mark as correct"
                              >
                                <FiCheckCircle size={14} />
                              </button>
                            )}
                            {q.options.length > 2 && (
                              <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="text-gray-700 hover:text-red-400 px-1 transition-colors">
                                <FiTrash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addOption(qIdx)} className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider mt-3 ml-11 flex items-center gap-1.5 hover:text-cyan-300 transition-all">
                          <FiPlus size={12} /> Add Option
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button type="button" onClick={addQuestion} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/[0.02] hover:border-cyan-500/20 transition-all text-sm font-semibold">
                + Add Another Question
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[300px] space-y-6">
            <SectionCard title="Settings">
              <div className="space-y-3">
                <Toggle label="Anonymous" desc="Identity hidden" value={form.isAnonymous} onClick={() => updateForm('isAnonymous', !form.isAnonymous)} icon={FiUsers} />
                <Toggle label="Quiz Mode" desc="Correct answers" value={form.isQuiz} onClick={() => {
                  updateForm('isQuiz', !form.isQuiz);
                  if (form.isQuiz) updateForm('cheatProtection', false);
                }} icon={FiCheckCircle} />
                <AnimatePresence>
                  {form.isQuiz && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Toggle 
                        label="Anti-Cheat" 
                        desc="Auto-submit on tab leave" 
                        value={form.cheatProtection} 
                        onClick={() => updateForm('cheatProtection', !form.cheatProtection)} 
                        icon={FiLock} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Toggle label="Restrict" desc="Login required" value={form.requiresAuth} onClick={() => updateForm('requiresAuth', !form.requiresAuth)} icon={FiShield} />
              </div>
            </SectionCard>

            <div className="bg-[#151515] border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Live Progress</span>
                <span className="text-[11px] font-bold text-cyan-500">{completionPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${completionPct}%` }} className="h-full bg-cyan-500" />
              </div>
            </div>

            <div className="space-y-3">
              <InfoCard icon={FiZap} title="Boost Engagement" desc="Shorter titles get 3x more votes." accent />
              <InfoCard icon={FiClock} title="Set a Deadline" desc="Time-limited polls create urgency." />
            </div>

            <p className="text-center text-[10px] text-gray-700 font-medium px-4 leading-relaxed">
              By publishing, you agree to our terms of service. You can edit this poll until the first vote is cast.
            </p>
          </aside>
        </div>
      </div>
    </form>
  );
};

export default CreatePollPage;