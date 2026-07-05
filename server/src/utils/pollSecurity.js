import bcrypt from 'bcryptjs';

export const hashAccessCode = async (code) => {
  if (!code?.trim()) return null;
  return bcrypt.hash(code.trim(), 12);
};

export const verifyAccessCode = async (code, hash) => {
  if (!hash || !code?.trim()) return false;
  return bcrypt.compare(code.trim(), hash);
};

export const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const sanitizePollForPublic = (poll, { includeQuestions = true } = {}) => {
  const obj = poll.toObject({ virtuals: true });
  delete obj.accessCodeHash;
  delete obj.createdBy;
  if (obj.questions) {
    obj.questions = obj.questions.map((q) => {
      const question = { ...q };
      delete question.correctOption;
      if (poll.shuffleOptions && includeQuestions && question.options) {
        question.options = shuffleArray(question.options);
      }
      return question;
    });
  }
  obj.requiresAccessCode = Boolean(poll.accessCodeHash);
  if (!includeQuestions) {
    delete obj.questions;
    obj.locked = true;
  }
  return obj;
};

export const validateEmailDomain = (email, allowedDomains) => {
  if (!allowedDomains?.length) return true;
  const domain = email?.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return allowedDomains.some((d) => d.toLowerCase() === domain);
};
