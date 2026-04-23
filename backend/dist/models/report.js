import mongoose from 'mongoose';
const reportSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    category: {
        type: String,
        enum: ['pothole', 'garbage', 'water', 'electricity', 'road', 'streetlight', 'drainage', 'other'],
        required: true,
        index: true,
    },
    description: { type: String },
    status: {
        type: String,
        enum: ['pending', 'verified', 'in_progress', 'resolved', 'rejected'],
        default: 'pending',
    },
    upvoteCount: { type: Number, default: 0 },
    upvotedBy: [{ type: String }], // user IDs
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
});
// 2dsphere index for geospatial queries
reportSchema.index({ location: '2dsphere' });
// Compound index for feed sorting
reportSchema.index({ upvoteCount: -1, createdAt: -1 });
export const Report = mongoose.model('Report', reportSchema);
