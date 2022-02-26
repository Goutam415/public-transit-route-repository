const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserRoute = require('../models/user-route');
const RouteStop = require('../models/route-stop');

router.patch('/update/:routeStopId', (req, res, next) => {
    const id = req.params.routeStopId;
    const updateObj = {};

    for (const prop of Object.keys(req.body)) {
        updateObj[prop] = req.body[prop];
    }

    RouteStop
        .updateOne({
            _id: id
        }, {
            $set: updateObj
        })
        .exec()
        .then(result => {
            if (result.matchedCount > 0) {
                res.status(200).json({
                    message: 'Route stop updated successfully'
                });
            } else {
                res.status(404).json({
                    message: 'This route does not exist'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'internal server error',
                error: {
                    name: err.name,
                    message: err.message
                }
            });
        });
});

router.patch('/add/:routeId', (req, res, next) => {
    const id = req.params.routeId;
    let routeStop = {
        _id: mongoose.Types.ObjectId()
    };

    for (const prop of Object.keys(req.body)) {
        routeStop[prop] = req.body[prop];
    }

    routeStop = new RouteStop(routeStop);
    UserRoute
        .updateOne({
            _id: id
        }, {
            $push: {
                stops: routeStop._id
            }
        })
        .then(() => routeStop.save())
        .then(routeStop => {
            res.status(200).json({
                message: 'Stop added successfully',
                payload: routeStop
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'internal server error',
                error: {
                    name: err.name,
                    message: err.message
                }
            });
        });
});

module.exports = router;