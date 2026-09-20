const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: [true, 'State name is required'],
      unique: true,
      trim: true
    },
    stateCode: {
      type: String,
      required: [true, 'State code/slug is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    type: {
      type: String,
      enum: ['State', 'UT'],
      default: 'State'
    },
    districts: {
      type: [String],
      default: []
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

locationSchema.index({ state: 1, 'districts': 1 });

module.exports = mongoose.model('Location', locationSchema);
