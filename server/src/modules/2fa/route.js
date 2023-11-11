const { Router } = require('express');
const twoFaController = require('./controller');
const twoFARoute = Router();

twoFARoute.get('/2fa/qr', twoFaController.generateQr);

module.exports = twoFARoute;