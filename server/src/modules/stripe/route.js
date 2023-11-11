const { Router } = require('express');
const stripeController = require('./controller');
const stripeRoute = Router();

stripeRoute.get('/stripe/config', stripeController.getConfig);
stripeRoute.post('/stripe/add-card', stripeController.addCard);

module.exports = stripeRoute;