const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: "MATCHAMBOU Messowè Maxime"
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedUrl: String,
  publishedAt: Date,
  sources: [String],
  keywords: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);