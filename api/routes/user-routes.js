const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserRoute = require('../models/user-route');
const RouteStop = require('../models/route-stop');


router.get('/', (req, res, next) => {
    UserRoute
        .find()
        .select('_id routeId status name stops')
        .populate('stops', 'name description lat lng stopId')
        .exec()
        .then(result => {
            if (result.length > 0) {
                res.status(200).json({
                    message: result.length + ' routes found',
                    result
                });
            } else {
                res.status(404).json({
                    message: 'This route does not exist',
                    result
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

router.post('/', (req, res, next) => {
    // Add Ids to each stops.
    let stops = req.body.stops.map(stop => {
        delete stop.stopId;
        stop['_id'] = mongoose.Types.ObjectId();
        return stop;
    });

    // Save route
    RouteStop.create(stops)
        .then(result => {
            stops = result;
            // Add Id to User Route
            const userRoute = new UserRoute({
                ...req.body,
                _id: mongoose.Types.ObjectId()
            });

            return userRoute.save();
        })
        .then(userRoute => {
            const payload = {
                _id: userRoute._id,
                name: userRoute.name,
                direction: userRoute.direction,
                routeId: userRoute.routeId,
                status: userRoute.status,
                stops
            };

            // return the success result
            res.status(200).json({
                message: 'Route saved successfully',
                payload: payload
            });
        })
        .catch(err => {
            console.log('error saving : ', err);
            // Return the error
            res.status(500).json({
                message: 'Internal server error',
                error: err
            });
        });
});

router.get('/:routeId', (req, res, next) => {
    const id = req.params.routeId;
    UserRoute
        .findById(id)
        .select('_id routeId status name stops')
        .populate('stops', 'name description lat lng stopId')
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: 'Received ID ',
                    result
                });
            } else {
                res.status(404).json({
                    message: 'This route does not exist',
                    result: {}
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

router.patch('/:routeId', (req, res, next) => {
    const id = req.params.routeId;
    const updateObj = {};

    console.log('body : ', req.body);
    for (const prop of Object.keys(req.body)) {
        updateObj[prop] = req.body[prop];
    }

    UserRoute
        .updateOne({
            _id: id
        }, {
            $set: updateObj
        })
        .exec()
        .then(result => {
            if (result.matchedCount > 0) {
                res.status(200).json({
                    message: 'Route updated successfully'
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

router.delete('/:routeId', (req, res, next) => {
    const id = req.params.routeId;
    UserRoute
        .remove({
            _id: id
        })
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: 'Route deleted successfully',
                });
            } else {
                res.status(404).json({
                    message: 'This route does not exist',
                    id
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

module.exports = router;