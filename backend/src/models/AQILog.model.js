const mongoose = require('mongoose');

const aqiLogSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  aqiValue: { type: Number, required: true },
  category: { type: String, required: true },
  dominantPollutant: { type: String },
  regionCode: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries on recent data
aqiLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AQILog', aqiLogSchema);
