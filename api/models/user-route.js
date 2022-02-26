const mongoose = require('mongoose');

const userRouteSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    direction: { 
        type: String, enum: ['UP', 'DOWN'],
        required: true
    },
    routeId: { 
        type: String,
        require: true,
        unique: true,
        default: Math.random().toString(16).slice(2)
    },
    status: { 
        type: String,
        default: 'Active',
        enum: ['Active', 'Inactive'],
        require: true 
    },
    stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RouteStop' }],
});

module.exports = mongoose.model('UserRoute', userRouteSchema);