const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  image_url: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  category: {
    type: String,
    required: true,
    enum: [
      'stubble_burning', 'garbage_burning', 'industrial_burning',
      'water_misuse', 'water_pollution', 'industrial_pollution',
      'illegal_dumping', 'fake_plantation', 'illegal_construction',
      'extreme_aqi', 'green_cover_loss', 'govt_negligence',
      'toxic_waste'
    ]
  },
  description: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  embedding_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'resolved'],
    default: 'pending'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

// GeoJSON for Mapbox
reportSchema.index({ "location.lng": 1, "location.lat": 1 });

// Text Index for RAG keyword search
reportSchema.index({ 
  category: 'text', 
  description: 'text', 
  summary: 'text' 
}, {
  weights: {
    category: 10,
    summary: 5,
    description: 2
  },
  name: "ReportTextIndex"
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
