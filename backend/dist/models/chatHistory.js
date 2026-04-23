import mongoose from 'mongoose';
const chatHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    response: { type: String, required: true },
    reportId: { type: String, index: true },
    confidence: { type: Number },
    createdAt: { type: Date, default: Date.now },
});
chatHistorySchema.index({ userId: 1, createdAt: -1 });
export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
