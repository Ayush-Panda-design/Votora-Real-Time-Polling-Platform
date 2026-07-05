import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    questionText: { type: String },
    selectedOption: { type: String, default: null },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
    respondent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    answers: { type: [answerSchema], required: true },
    submittedAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

responseSchema.index({ pollId: 1, respondent: 1 }, { sparse: true });
responseSchema.index({ pollId: 1, ipAddress: 1 }, { sparse: true });

const Response = mongoose.model('Response', responseSchema);
export default Response;
