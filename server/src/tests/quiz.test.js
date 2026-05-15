import { describe, it, expect } from 'vitest';


const calculateScore = (questions, userAnswers) => {
  let score = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.options[q.correctOption]) {
      score++;
    }
  });
  return score;
};

describe('Quiz Scoring Logic', () => {
  const mockQuestions = [
    { question: 'Q1', options: ['A', 'B'], correctOption: 0 },
    { question: 'Q2', options: ['C', 'D'], correctOption: 1 },
  ];

  it('should return 2 for all correct answers', () => {
    const userAnswers = { 0: 'A', 1: 'D' };
    const score = calculateScore(mockQuestions, userAnswers);
    expect(score).toBe(2);
  });

  it('should return 0 for all incorrect answers', () => {
    const userAnswers = { 0: 'B', 1: 'C' };
    const score = calculateScore(mockQuestions, userAnswers);
    expect(score).toBe(0);
  });

  it('should handle partial correct answers', () => {
    const userAnswers = { 0: 'A', 1: 'C' };
    const score = calculateScore(mockQuestions, userAnswers);
    expect(score).toBe(1);
  });
});
