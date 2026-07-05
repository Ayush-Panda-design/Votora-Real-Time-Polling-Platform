import asyncHandler from '../utils/asyncHandler.js';
import { submitResponseService, getResponsesService, getResponseByIdService } from '../services/response.service.js';
import { emitNewResponse } from '../services/socket.service.js';

export const submitResponse = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const userId = req.user?._id || null;
  const ipAddress = req.ip;

  const { response, analytics, quizResults } = await submitResponseService(
    req.params.pollId,
    answers,
    userId,
    ipAddress,
    req.body.isAutoSubmitted
  );

  const poll = await (await import('../models/Poll.js')).default.findById(req.params.pollId).select('createdBy');
  emitNewResponse(req.params.pollId, analytics, poll?.createdBy?.toString());

  res.status(201).json({
    success: true,
    message: 'Response submitted successfully',
    response,
    quizResults
  });
});

export const getResponses = asyncHandler(async (req, res) => {
  const responses = await getResponsesService(req.params.pollId, req.user._id);
  res.status(200).json({ success: true, responses });
});

export const getResponseById = asyncHandler(async (req, res) => {
  const response = await getResponseByIdService(req.params.pollId, req.params.responseId, req.user._id);
  res.status(200).json({ success: true, response });
});
