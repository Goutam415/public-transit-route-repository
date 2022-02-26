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
    // Capture all the routes
    let routes = req.body.routes;
    // Get all the stops in an array
    let allStops = [];
    routes.forEach(route => {
        // Add id to all the stops
        route.stops = route.stops.map(stop => {
            stop['_id'] = mongoose.Types.ObjectId();
            return stop;
        });

        allStops = allStops.concat(route.stops);
    });

    // Save all stops at once.
    RouteStop
        .create(allStops)
        .then(stops => {
            // Storing all the stops. So that, we can add 
            // these saved values back while returning
            allStops = stops;
            // Adding id to all the routes
            routes = routes.map(route => {
                route = new UserRoute({
                    _id: mongoose.Types.ObjectId(),
                    ...route,
                });

                return route;
            });

            // Save all the routes at once.
            return UserRoute.create(routes);
        })
        .then(userRoutes => {
            userRoutes = userRoutes.map(route => {
                return {
                    _id: route._id,
                    name: route.name,
                    direction: route.direction,
                    routeId: route.routeId,
                    status: route.status,
                    stops: route.stops.map(
                        routeStop => allStops.find(
                            createdRouteStop => createdRouteStop._id === routeStop
                        )
                    )
                };
            });

            // return the success result
            res.status(200).json({
                message: 'Route saved successfully',
                payload: userRoutes
            });
        })
        .catch(err => {
            console.log('err : ', err);
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