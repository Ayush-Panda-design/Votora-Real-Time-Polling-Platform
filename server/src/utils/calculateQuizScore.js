/**
 * Calculates quiz score from questions and user answers.
 * @param {Array} questions - Poll questions with options and correctOption index
 * @param {Object} userAnswers - Map of questionIndex -> selected option string
 * @returns {number}
 */
export const calculateQuizScore = (questions, userAnswers) => {
  let score = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.options[q.correctOption]) {
      score++;
    }
  });
  return score;
};

export default calculateQuizScore;
