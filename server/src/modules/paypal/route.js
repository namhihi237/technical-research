const { Router } = require('express');
const paypalController = require('./controller');
const paypalRoute = Router();

paypalRoute.get('/paypal/payout', paypalController.payout);

module.exports = paypalRoute;