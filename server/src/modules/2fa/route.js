const { Router } = require('express');
const twoFaController = require('./controller');
const twoFARoute = Router();

twoFARoute.get('/2fa/qr', twoFaController.generateQr);
twoFARoute.get('/2fa/verify', twoFaController.verify2Fa);


module.exports = twoFARoute;