import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiBriefcase, FiBarChart2, FiShield,
  FiTrash2, FiLogOut, FiActivity, FiZap, FiAward,
  FiEdit3, FiCamera, FiCheck, FiX, FiLock, FiEye, FiEyeOff,
} from 'react-icons/fi';

import { updateProfile, logoutUser, uploadAvatar } from '../authSlice';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../../utils/helpers';


const T = {
  bg:       '#0f0f0f',
  surface:  '#151515',
  card:     '#1a1a1a',
  border:   'rgba(255,255,255,0.06)',
  accent:   '#06b6d4',
  accentLo: 'rgba(6,182,212,0.10)',
  accentMd: 'rgba(6,182,212,0.25)',
  muted:    '#6b6b6b',
  text:     '#e5e5e5',
  subtle:   '#a3a3a3',
};

const cardVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }),
};


const ProfilePage = () => {
  const dispatch     = useDispatch();
  const fileInputRef = useRef(null);
  const { user, loading } = useSelector((s) => s.auth);

  const [stats, setStats]                 = useState(null);
  const [isEditing, setIsEditing]         = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name:       user?.name || '',
    occupation: user?.occupation || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '', newPassword: '', confirmPassword: '',
  });

  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

  useEffect(() => {
    api.get('/users/profile/stats')
      .then((r) => setStats(r.data.stats))
      .catch(console.error);
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateProfile(profileForm));
    if (updateProfile.fulfilled.match(res)) { toast.success('Profile updated'); setIsEditing(false); }
    else toast.error(res.payload || 'Update failed');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Max size 2 MB');
    const res = await dispatch(uploadAvatar(file));
    if (uploadAvatar.fulfilled.match(res)) toast.success('Avatar updated');
    else toast.error(res.payload || 'Upload failed');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    try {
      await api.patch('/users/profile/password', { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      toast.success('Password updated');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwSection(false);
    } catch { toast.error('Failed to update password'); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('This will permanently delete your account. Continue?')) return;
    try {
      await api.delete('/users/profile');
      toast.success('Account deleted');
      dispatch(logoutUser());
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Sora', 'DM Sans', sans-serif" }}>

      {/* font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(6,182,212,0.25); }
        input { font-family: inherit; }
        .av-wrap:hover .av-overlay { opacity: 1 !important; }
      `}</style>

     
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '40%', width: 560, height: 320, background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: -80, right: '5%', width: 380, height: 240, background: 'radial-gradient(ellipse, rgba(6,182,212,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '36px 24px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

       
        <motion.div variants={cardVariants} custom={0} initial="hidden" animate="visible"
          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 22, padding: '28px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 28 }}>

          {/* avatar */}
          <div style={{ position: 'relative' }}>
            <div
              className="av-wrap"
              style={{ width: 96, height: 96, borderRadius: 20, overflow: 'hidden', border: `2px solid ${T.accentMd}`, background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: T.accent, position: 'relative', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {user?.avatar
                ? <img src={getImageUrl(user.avatar)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                : user?.name?.[0]?.toUpperCase()
              }
              <div className="av-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: 0, transition: 'opacity .2s', fontSize: 11, color: '#fff', fontWeight: 600 }}>
                <FiCamera size={16} />
                Change
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

            <button type="button" onClick={() => setIsEditing((v) => !v)}
              style={{ position: 'absolute', bottom: -8, right: -8, width: 30, height: 30, borderRadius: 9, background: isEditing ? T.accent : T.card, border: `1px solid ${isEditing ? T.accent : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isEditing ? '#fff' : T.subtle, transition: 'all .2s' }}>
              <FiEdit3 size={12} />
            </button>
          </div>

          {/*  */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' }}>{user?.name}</h1>
              <RoleBadge role={user?.role} />
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <InfoRow icon={<FiMail size={12} />} text={user?.email} />
              <InfoRow icon={<FiBriefcase size={12} />} text={user?.occupation || 'No occupation set'} />
            </div>
          </div>

          {}
          <button type="button" onClick={() => dispatch(logoutUser())}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, background: T.card, border: `1px solid ${T.border}`, color: T.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}>
            <FiLogOut size={14} /> Sign out
          </button>
        </motion.div>

        {}
        <motion.div variants={cardVariants} custom={1} initial="hidden" animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Polls Created', value: stats?.totalPolls ?? '—',                    icon: <FiBarChart2 size={14} /> },
            { label: 'Total Votes',   value: stats?.totalResponses ?? '—',                 icon: <FiActivity size={14} /> },
            { label: 'Active Polls',  value: stats?.activePolls ?? '—',                    icon: <FiZap size={14} /> },
            { label: 'Day Streak',    value: stats?.streak ? `${stats.streak}d` : '—',    icon: <FiAward size={14} /> },
          ].map((s, i) => (
            <motion.div key={s.label} variants={cardVariants} custom={i + 2} initial="hidden" animate="visible"
              style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: T.accentLo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10.5, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {}
          <motion.div variants={cardVariants} custom={6} initial="hidden" animate="visible"
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionHeading icon={<FiUser size={13} />} title="Profile Info" subtitle="Update your name & occupation" />
              <PillToggle active={isEditing} onClick={() => setIsEditing((v) => !v)} label={isEditing ? 'Cancel' : 'Edit'} />
            </div>

            <AnimatePresence>
              {isEditing ? (
                <motion.form key="edit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleUpdateProfile} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <FieldWrapper label="Display Name">
                    <StyledInput value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Your full name" required />
                  </FieldWrapper>
                  <FieldWrapper label="Occupation">
                    <StyledInput value={profileForm.occupation} onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })} placeholder="e.g. Product Designer" />
                  </FieldWrapper>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <PrimaryBtn type="submit" disabled={loading} style={{ flex: 1 }}>
                      <FiCheck size={13} /> {loading ? 'Saving…' : 'Save Changes'}
                    </PrimaryBtn>
                    <GhostBtn type="button" onClick={() => setIsEditing(false)}>
                      <FiX size={13} />
                    </GhostBtn>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ProfileField icon={<FiUser size={13} />} label="Name" value={user?.name} />
                  <ProfileField icon={<FiMail size={13} />} label="Email" value={user?.email} />
                  <ProfileField icon={<FiBriefcase size={13} />} label="Occupation" value={user?.occupation || '—'} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {}
          <motion.div variants={cardVariants} custom={7} initial="hidden" animate="visible"
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionHeading icon={<FiShield size={13} />} title="Security" subtitle="Manage your password" />
              <PillToggle active={showPwSection} onClick={() => setShowPwSection((v) => !v)} label={showPwSection ? 'Cancel' : 'Change'} />
            </div>

            <AnimatePresence>
              {showPwSection ? (
                <motion.form key="pw" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleChangePassword} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                  <FieldWrapper label="Current Password">
                    <PasswordInput value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} show={showPw.old} toggle={() => setShowPw((s) => ({ ...s, old: !s.old }))} placeholder="Current password" />
                  </FieldWrapper>
                  <FieldWrapper label="New Password">
                    <PasswordInput value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} show={showPw.new} toggle={() => setShowPw((s) => ({ ...s, new: !s.new }))} placeholder="New password" />
                  </FieldWrapper>
                  <FieldWrapper label="Confirm New Password">
                    <PasswordInput value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} show={showPw.confirm} toggle={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))} placeholder="Confirm password" />
                  </FieldWrapper>
                  <PrimaryBtn type="submit" style={{ width: '100%' }}>
                    <FiLock size={13} /> Update Password
                  </PrimaryBtn>
                </motion.form>
              ) : (
                <motion.div key="pw-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: T.card, borderRadius: 12, border: `1px solid ${T.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, flexShrink: 0 }}><FiLock size={14} /></div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Password protected</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: T.muted }}>Click "Change" to update your password</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Plan */}
          <motion.div variants={cardVariants} custom={8} initial="hidden" animate="visible"
            style={{ background: `linear-gradient(135deg, ${T.accentLo} 0%, rgba(6,182,212,0.03) 100%)`, border: `1px solid ${T.accentMd}`, borderRadius: 18, padding: '22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FiZap size={14} color={T.accent} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your Plan</span>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px' }}>
              {user?.role === 'admin' ? 'Admin Access' : 'Free Tier'}
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 12.5, color: T.subtle, lineHeight: 1.65 }}>
              You've created <strong style={{ color: T.text }}>{stats?.totalPolls ?? 0} polls</strong> and collected <strong style={{ color: T.text }}>{stats?.totalResponses ?? 0} responses</strong> so far. Keep engaging your audience with focused, time-limited polls for best results.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Unlimited polls & questions',
                'Real-time response analytics',
                'Anonymous & authenticated modes',
              ].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.subtle }}>
                  <div style={{ width: 16, height: 16, borderRadius: 5, background: T.accentLo, border: `1px solid ${T.accentMd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FiCheck size={9} color={T.accent} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Deleting account */}
          <motion.div variants={cardVariants} custom={9} initial="hidden" animate="visible"
            style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.14)', borderRadius: 18, padding: '22px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <FiTrash2 size={13} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>Delete Account</span>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 12.5, color: T.muted, lineHeight: 1.65 }}>
                Permanently removes your account, all polls, and collected responses. This action <strong style={{ color: T.subtle }}>cannot be undone</strong>.
              </p>
            </div>
            <button type="button" onClick={handleDeleteAccount}
              style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: 'transparent', border: '1px solid rgba(239,68,68,0.30)', color: '#ef4444', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.30)'; }}>
              Delete my account
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
};



const SectionHeading = ({ icon, title, subtitle }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ color: T.accent }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}>{title}</span>
    </div>
    {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: T.muted }}>{subtitle}</p>}
  </div>
);

const InfoRow = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: T.muted }}>
    <span style={{ flexShrink: 0 }}>{icon}</span>
    {text}
  </div>
);

const ProfileField = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accentLo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ margin: 0, fontSize: 10.5, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: '1px 0 0', fontSize: 13, fontWeight: 500 }}>{value}</p>
    </div>
  </div>
);

const RoleBadge = ({ role }) => (
  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: T.accentLo, color: T.accent, border: `1px solid ${T.accentMd}`, borderRadius: 6, padding: '2px 8px' }}>
    {role}
  </span>
);

const FieldWrapper = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const inputBase = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 10,
  background: '#0f0f0f',
  border: '1px solid rgba(255,255,255,0.06)',
  color: '#e5e5e5',
  fontSize: 13.5,
  outline: 'none',
  transition: 'border-color .2s',
};

const StyledInput = ({ style, ...props }) => (
  <input
    style={{ ...inputBase, ...style }}
    onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
    onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
    {...props}
  />
);

const PasswordInput = ({ show, toggle, style, ...props }) => (
  <div style={{ position: 'relative' }}>
    <input
      type={show ? 'text' : 'password'}
      style={{ ...inputBase, paddingRight: 40, ...style }}
      onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
      onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
      {...props}
    />
    <button type="button" onClick={toggle}
      style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
    </button>
  </div>
);

const PillToggle = ({ active, onClick, label }) => (
  <button type="button" onClick={onClick}
    style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: active ? T.accentLo : 'transparent', border: `1px solid ${active ? T.accentMd : 'rgba(255,255,255,0.06)'}`, color: active ? T.accent : '#6b6b6b', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
    {label}
  </button>
);

const PrimaryBtn = ({ children, style, ...props }) => (
  <button
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 18px', borderRadius: 11, background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', border: '1px solid rgba(6,182,212,0.5)', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 14px rgba(6,182,212,0.22)', transition: 'opacity .2s', ...style }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    {...props}>
    {children}
  </button>
);

const GhostBtn = ({ children, style, ...props }) => (
  <button
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 14px', borderRadius: 11, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#6b6b6b', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', ...style }}
    onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e5e5'; e.currentTarget.style.borderColor = '#a3a3a3'; }}
    onMouseLeave={(e) => { e.currentTarget.style.color = '#6b6b6b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
    {...props}>
    {children}
  </button>
);

export default ProfilePage;