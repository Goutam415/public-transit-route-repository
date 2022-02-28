const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Importing routes.
const userRoutes = require('./api/routes/user-routes');
const routeStops = require('./api/routes/route-stops');

// establish connection with mongodb
mongoose.connect(
    'mongodb+srv://goutam415:goutam123@cluster0.joajn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
);

// Helps to log the request info
app.use(morgan('dev'));

// Helps parseing the request body
// Now, we can read any req like this: req.body.id
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Handling CORS setup
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Request methods you wish to allow
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );

        return res.status(200).json({});
    }

    next();
});

// Routes that handle API requests.
app.use('/user-routes', userRoutes);
app.use('/route-stop', routeStops);

// Incase of no routes were able to handle the request,
// We throw the error saying no routes found.
app.use((req, res, next) => {
    const error = new Error('This route does not exist');
    error.status = 404;
    next(error);
});

// Returning the unhandled request error message.
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

module.exports = app;