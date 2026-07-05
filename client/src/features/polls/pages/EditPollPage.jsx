import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPollById, updatePoll } from '../pollSlice';
import { FiArrowLeft, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import notify from '../../../utils/notify';
import Input from '../../../components/ui/Input';
import Spinner from '../../../components/ui/Spinner';
import SectionGuide from '../../../components/ui/SectionGuide';

const EditPollPage = () => {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { loading } = useSelector((s) => s.polls);
  const [form, setForm] = useState(null);

  useEffect(() => {
    dispatch(fetchPollById(id)).then((res) => {
      if (fetchPollById.fulfilled.match(res)) {
        const p = res.payload.poll;
        setForm({
          title: p.title, description: p.description || '', isAnonymous: p.isAnonymous,
          requiresAuth: p.requiresAuth, isQuiz: p.isQuiz, cheatProtection: p.cheatProtection || false,
          timeLimitSystem: p.timeLimitSystem || 'none',
          timerDuration: p.timerDuration || '',
          expiresAt: p.expiresAt ? p.expiresAt.slice(0, 16) : '',
          questions: p.questions.map((q) => ({ question: q.question, options: q.options, required: q.required })),
        });
      }
    });
  }, [id, dispatch]);

  if (!form) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const updateField  = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateQ      = (i, key, val) => { const qs = [...form.questions]; qs[i] = { ...qs[i], [key]: val }; updateField('questions', qs); };
  const updateOption = (qi, oi, val) => { const qs = [...form.questions]; const opts = [...qs[qi].options]; opts[oi] = val; qs[qi] = { ...qs[qi], options: opts }; updateField('questions', qs); };
  const addOption    = (qi) => updateQ(qi, 'options', [...form.questions[qi].options, '']);
  const removeOption = (qi, oi) => updateQ(qi, 'options', form.questions[qi].options.filter((_, i) => i !== oi));
  const addQuestion  = () => updateField('questions', [...form.questions, { question: '', options: ['', ''], required: true }]);
  const removeQuestion = (i) => updateField('questions', form.questions.filter((_, idx) => idx !== i));
  const moveQuestion = (qIdx, direction) => {
    const target = qIdx + direction;
    if (target < 0 || target >= form.questions.length) return;
    const qs = [...form.questions];
    [qs[qIdx], qs[target]] = [qs[target], qs[qIdx]];
    updateField('questions', qs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      ...form, 
      expiresAt: form.timeLimitSystem === 'expiry' && form.expiresAt ? new Date(form.expiresAt).toISOString() : null, 
      timerDuration: form.timeLimitSystem === 'timer' && form.timerDuration ? Number(form.timerDuration) : null,
      questions: form.questions.map((q) => ({ ...q, options: q.options.filter(Boolean) })) 
    };
    const res = await dispatch(updatePoll({ id, data: payload }));
    if (updatePoll.fulfilled.match(res)) { notify.success('Poll updated!'); navigate('/dashboard'); }
    else notify.error(res.payload || 'Update failed');
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#121212] text-white px-6 py-8">
      {/* */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#3b82f6]/10 blur-[140px]" />
      </div>

      <div className="flex items-center gap-4 mb-10">
        <button type="button" onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
          <FiArrowLeft />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Edit Poll</h1>
          <p className="text-gray-400 text-sm">Make changes to your poll</p>
        </div>
        <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] transition font-semibold disabled:opacity-50">
          Save Changes
        </button>
      </div>

      <SectionGuide page="edit" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Poll Details</h2>
            <Input label="Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
            <textarea placeholder="Description" className="w-full p-3 rounded-xl bg-[#121212] border border-white/10 focus:border-[#3b82f6] outline-none resize-none h-20" value={form.description} onChange={(e) => updateField('description', e.target.value)} />
            <div className="space-y-4 pt-2 border-t border-white/5">
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Time Limit System</p>
              <div className="grid grid-cols-3 gap-2">
                {['none', 'expiry', 'timer'].map(sys => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => updateField('timeLimitSystem', sys)}
                    className={`py-2 px-3 rounded-xl border text-[13px] font-medium transition-all ${
                      form.timeLimitSystem === sys
                        ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-white'
                        : 'border-white/10 bg-[#121212] text-gray-500 hover:bg-white/5'
                    }`}
                  >
                    {sys === 'none' ? 'None' : sys === 'expiry' ? 'Auto Expiry' : 'Manual Timer'}
                  </button>
                ))}
              </div>

              {form.timeLimitSystem === 'expiry' && (
                <div>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry Date & Time</p>
                  <input type="datetime-local" className="w-full p-3 rounded-xl bg-[#121212] border border-white/10 focus:border-[#3b82f6] outline-none" value={form.expiresAt} onChange={(e) => updateField('expiresAt', e.target.value)} />
                </div>
              )}

              {form.timeLimitSystem === 'timer' && (
                <div>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Timer Duration (Minutes)</p>
                  <input type="number" min="1" max="1440" placeholder="e.g. 10" className="w-full p-3 rounded-xl bg-[#121212] border border-white/10 focus:border-[#3b82f6] outline-none" value={form.timerDuration} onChange={(e) => updateField('timerDuration', e.target.value)} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Questions</h2>
            {form.questions.map((q, qi) => (
              <div key={qi} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#3b82f6] text-sm font-semibold">Question {qi + 1}</span>
                  <div className="flex gap-2 items-center">
                    <button type="button" onClick={() => updateQ(qi, 'required', !q.required)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${q.required ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-white' : 'border-white/[0.06] bg-[#1a1a1a] text-[#6b6b6b] hover:text-white'}`}>
                      {q.required ? 'Mandatory' : 'Optional'}
                    </button>
                    <button type="button" onClick={() => moveQuestion(qi, -1)} disabled={qi === 0}
                      className="text-gray-500 hover:text-white p-1 disabled:opacity-30" title="Move up">
                      <FiChevronUp size={16} />
                    </button>
                    <button type="button" onClick={() => moveQuestion(qi, 1)} disabled={qi === form.questions.length - 1}
                      className="text-gray-500 hover:text-white p-1 disabled:opacity-30" title="Move down">
                      <FiChevronDown size={16} />
                    </button>
                    {form.questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300">
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
                <input className="w-full p-3 rounded-xl bg-[#121212] border border-white/10 focus:border-[#3b82f6] outline-none" value={q.question} onChange={(e) => updateQ(qi, 'question', e.target.value)} placeholder="Question text..." required />
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input className="flex-1 p-2 rounded-xl bg-[#121212] border border-white/10 focus:border-[#3b82f6] outline-none" value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(qi, oi)} className="text-red-400 p-1.5 rounded transition-all flex-shrink-0"><FiTrash2 size={16} /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(qi)} className="text-[#3b82f6] text-sm mt-1 transition-colors">
                    + Add option
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addQuestion} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-gray-400 hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all">
              + Add Question
            </button>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 h-fit space-y-4 sticky top-6">
          <h2 className="font-semibold text-lg">Settings</h2>
          <Toggle label="Anonymous" desc="Allow anonymous voting" value={form.isAnonymous} onClick={() => updateField('isAnonymous', !form.isAnonymous)} />
          <Toggle label="Quiz Mode" desc="Correct answers" value={form.isQuiz} onClick={() => {
            updateField('isQuiz', !form.isQuiz);
            if (form.isQuiz) updateField('cheatProtection', false);
          }} />
          {form.isQuiz && (
            <Toggle label="Tab Monitor" desc="Auto-submit on tab leave (client-side)" value={form.cheatProtection} onClick={() => updateField('cheatProtection', !form.cheatProtection)} />
          )}
          <Toggle label="Require Login" desc="Authenticated users only" value={form.requiresAuth} onClick={() => updateField('requiresAuth', !form.requiresAuth)} />
          <button type="submit" disabled={loading} className="w-full px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition font-semibold disabled:opacity-50 mt-4">
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

/*  */
const Toggle = ({ label, desc, value, onClick }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>

    <button
      onClick={onClick}
      type="button"
      className={`w-11 h-6 rounded-full transition ${
        value ? 'bg-cyan-500' : 'bg-gray-700'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition ${
          value ? 'translate-x-6' : 'translate-x-1'
        } mt-1`}
      />
    </button>
  </div>
);

export default EditPollPage;
