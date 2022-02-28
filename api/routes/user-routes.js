const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserRoute = require('../models/user-route');
const RouteStop = require('../models/route-stop');
var _ = require('lodash');


router.get('/', (req, res, next) => {
    UserRoute
        .find()
        .select('_id routeId status name direction stops')
        .populate('stops', 'name description lat lng stopId')
        .exec()
        .then(result => {
            if (result.length > 0) {
                res.status(200).json({
                    message: result.length + ' routes found',
                    payload: result
                });
            } else {
                res.status(404).json({
                    message: 'This route does not exist',
                    payload: result
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

    console.log('direction : ', req.body);
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
        .select('_id routeId status name direction stops')
        .populate('stops', 'name description lat lng stopId')
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: 'Received ID ',
                    payload: result
                });
            } else {
                res.status(404).json({
                    message: 'This route does not exist',
                    payload: {}
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
    let updateObj = {};

    for (const prop of Object.keys(req.body)) {
        updateObj[prop] = req.body[prop];
    }
    let stopsToCreate = _.cloneDeep(updateObj['stops'].filter(stop => !stop._id || stop._id === null));

    stopsToCreate = stopsToCreate.map(stop => {
        delete stop.stopId;
        stop['_id'] = mongoose.Types.ObjectId();
        return stop;
    });

    RouteStop.create(stopsToCreate)
        .then(stops => {
            const existingStops = updateObj['stops'].filter(stop => stop._id !== null);
            updateObj['stops'] = existingStops.concat(stops);
        })
        .then(() => {
            return UserRoute
                .updateOne({
                    _id: id
                }, {
                    $set: updateObj
                })
                .exec();
        })
        .then(routeUpdateResult => {

            const stopUpdateOb$ = [];
            updateObj['stops'].forEach(stop => {
                stopUpdateOb$.push(
                    RouteStop.updateOne({
                        _id: stop._id
                    }, {
                        $set: stop
                    }).exec()
                )
            });
            Promise.all(stopUpdateOb$)
                .then(result => {
                    if (routeUpdateResult.matchedCount > 0) {
                        res.status(200).json({
                            message: 'Route updated successfully'
                        });
                    } else {
                        res.status(404).json({
                            message: 'This ruser oute does not exist'
                        });
                    }
                })
                .catch(err => {
                    if (routeUpdateResult.matchedCount > 0) {
                        res.status(200).json({
                            message: 'Route updated successfully. But, could not update stops.'
                        });
                    } else {
                        res.status(500).json({
                            message: 'internal server error',
                            error: {
                                name: err.name,
                                message: err.message
                            }
                        });
                    }
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