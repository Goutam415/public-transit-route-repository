const mongoose = require('mongoose');

const routeStopSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: { type: String, required: true },
    stopId: { 
        type: String,
        require: true,
        unique: true,
        default: Math.random().toString(16).slice(2)
    },
});

module.exports = mongoose.model('RouteStop', routeStopSchema);