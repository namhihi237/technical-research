const { Router } = require('express');
const uploadController = require('./controller');
const uploadRoute = Router();

uploadRoute.post('/upload/init-multiple-part', uploadController.initiateMultipartUpload);
uploadRoute.post('/upload/complete-multiple-part', uploadController.completeMultipartUpload);
uploadRoute.post('/upload/get-presigned-url', uploadController.getPresignedUrl);

module.exports = uploadRoute;