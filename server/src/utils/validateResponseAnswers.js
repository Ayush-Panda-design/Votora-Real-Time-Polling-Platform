import ApiError from './ApiError.js';

/**
 * Validates submitted answers against poll question definitions.
 */
export const validateResponseAnswers = (poll, answers) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, 'Answers array is required');
  }

  const seenIndices = new Set();

  for (const answer of answers) {
    const qi = answer.questionIndex;

    if (!Number.isInteger(qi) || qi < 0 || qi >= poll.questions.length) {
      throw new ApiError(400, `Invalid question index: ${qi}`);
    }

    if (seenIndices.has(qi)) {
      throw new ApiError(400, `Duplicate answer for question index ${qi}`);
    }
    seenIndices.add(qi);

    const question = poll.questions[qi];
    const selected = answer.selectedOption;

    if (selected == null || selected === '') continue;

    if (typeof selected !== 'string' || selected.trim().length === 0) {
      throw new ApiError(400, 'Answer must be a non-empty string');
    }

    if (selected.length > 500) {
      throw new ApiError(400, 'Answer exceeds maximum length');
    }

    if (!question.options.includes(selected)) {
      throw new ApiError(400, `Invalid option "${selected}" for question "${question.question}"`);
    }
  }
};

export default validateResponseAnswers;
