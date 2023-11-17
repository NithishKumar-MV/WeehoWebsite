const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    place: { type: mongoose.Schema.Types.ObjectId, required: true, ref:'Place' },
    user: {type:mongoose.Schema.Types.ObjectId, required:true},
    numberOfParticipants: { type: Number, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    price: Number,
    razorpayOrderId: String,
});

const BookingModel = mongoose.model('Booking', bookingSchema);

module.exports = BookingModel;