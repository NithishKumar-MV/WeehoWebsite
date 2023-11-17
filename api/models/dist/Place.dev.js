"use strict";

var mongoose = require('mongoose');

var placeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: String,
  address: String,
  photos: [String],
  description: String,
  extraInfo: String,
  date: String,
  // Added date field
  time: String,
  // Added time field
  maxParticipants: Number,
  price: Number
});
var PlaceModel = mongoose.model('Place', placeSchema);
module.exports = PlaceModel;
//# sourceMappingURL=Place.dev.js.map
