import { describe, it, expect } from 'vitest';
import calculateQuizScore from '../utils/calculateQuizScore.js';
import generatePollCode from '../utils/generatePollCode.js';

describe('Quiz Scoring Logic', () => {
  const mockQuestions = [
    { question: 'Q1', options: ['A', 'B'], correctOption: 0 },
    { question: 'Q2', options: ['C', 'D'], correctOption: 1 },
  ];

  it('should return 2 for all correct answers', () => {
    const userAnswers = { 0: 'A', 1: 'D' };
    expect(calculateQuizScore(mockQuestions, userAnswers)).toBe(2);
  });

  it('should return 0 for all incorrect answers', () => {
    const userAnswers = { 0: 'B', 1: 'C' };
    expect(calculateQuizScore(mockQuestions, userAnswers)).toBe(0);
  });

  it('should handle partial correct answers', () => {
    const userAnswers = { 0: 'A', 1: 'C' };
    expect(calculateQuizScore(mockQuestions, userAnswers)).toBe(1);
  });
});

describe('Poll Code Generation', () => {
  it('should generate an 8-character uppercase code', () => {
    const code = generatePollCode();
    expect(code).toMatch(/^[A-F0-9]{8}$/);
  });

  it('should generate unique codes', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generatePollCode()));
    expect(codes.size).toBe(20);
  });
});
