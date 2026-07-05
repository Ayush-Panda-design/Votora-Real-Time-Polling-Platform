import { describe, it, expect } from 'vitest';
import validateResponseAnswers from '../utils/validateResponseAnswers.js';
import ApiError from '../utils/ApiError.js';

const mockPoll = {
  questions: [
    { question: 'Favorite color?', options: ['Red', 'Blue', 'Green'], required: true },
    { question: 'Optional?', options: ['Yes', 'No'], required: false },
  ],
};

describe('validateResponseAnswers', () => {
  it('accepts valid answers', () => {
    expect(() => validateResponseAnswers(mockPoll, [
      { questionIndex: 0, selectedOption: 'Blue' },
    ])).not.toThrow();
  });

  it('rejects invalid question index', () => {
    expect(() => validateResponseAnswers(mockPoll, [
      { questionIndex: 5, selectedOption: 'Red' },
    ])).toThrow(ApiError);
  });

  it('rejects option not in poll', () => {
    expect(() => validateResponseAnswers(mockPoll, [
      { questionIndex: 0, selectedOption: 'Purple' },
    ])).toThrow(/Invalid option/);
  });

  it('rejects duplicate question indices', () => {
    expect(() => validateResponseAnswers(mockPoll, [
      { questionIndex: 0, selectedOption: 'Red' },
      { questionIndex: 0, selectedOption: 'Blue' },
    ])).toThrow(/Duplicate answer/);
  });
});
