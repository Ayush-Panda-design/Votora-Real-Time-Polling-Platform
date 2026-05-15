import mongoose from 'mongoose';

/**
 * Calculates analytics for a given poll from its responses using MongoDB Aggregation.
 * Returns total responses and per-question option vote counts.
 * @param {string|mongoose.Types.ObjectId} pollId - The poll's MongoDB ID
 * @returns {Object} Analytics object { totalResponses, questionStats }
 */
const calculateAnalytics = async (pollId) => {
  const Response = mongoose.model('Response');
  const Poll = mongoose.model('Poll');

  const poll = await Poll.findById(pollId);
  if (!poll) return null;

  const objectId = new mongoose.Types.ObjectId(pollId);

  // 1. Get total responses extremely fast using countDocuments
  const totalResponses = await Response.countDocuments({ pollId: objectId });

  // 2. Use Aggregation Pipeline to offload calculation to the database
  const aggResult = await Response.aggregate([
    { $match: { pollId: objectId } },
    { $unwind: '$answers' },
    { $match: { 'answers.selectedOption': { $ne: null } } },
    {
      $group: {
        _id: {
          questionIndex: '$answers.questionIndex',
          selectedOption: '$answers.selectedOption',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.questionIndex',
        options: {
          $push: {
            option: '$_id.selectedOption',
            count: '$count',
          },
        },
      },
    },
  ]);

  // Convert aggregation result to a map for O(1) lookups
  const aggMap = {};
  aggResult.forEach((item) => {
    aggMap[item._id] = item;
  });

  // 3. Build per-question stats by merging poll schema with aggregation data
  const questionStats = poll.questions.map((question, qIndex) => {
    const aggData = aggMap[qIndex] || { options: [] };

    const optionCounts = {};
    question.options.forEach((opt) => {
      optionCounts[opt] = 0;
    });

    let totalForQuestion = 0;

    // Populate actual counts from aggregation
    aggData.options.forEach((optData) => {
      // Only count if the option still exists in the poll schema
      if (optionCounts[optData.option] !== undefined) {
        optionCounts[optData.option] = optData.count;
        totalForQuestion += optData.count;
      }
    });

    // Compute percentages
    const optionPercentages = {};
    Object.entries(optionCounts).forEach(([opt, count]) => {
      optionPercentages[opt] =
        totalForQuestion > 0
          ? Math.round((count / totalForQuestion) * 100)
          : 0;
    });

    return {
      questionIndex: qIndex,
      questionText: question.question,
      options: question.options,
      optionCounts,
      optionPercentages,
      totalAnswered: totalForQuestion,
      skipped: totalResponses - totalForQuestion,
    };
  });

  return { totalResponses, questionStats };
};

export default calculateAnalytics;
