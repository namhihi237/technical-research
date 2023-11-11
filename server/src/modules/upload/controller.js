const aws = require('../../utils/aws');

async function initiateMultipartUpload(req, res) {
  try {
    const fileName = req.body.fileName;
    const dataCreated = await aws.createMultipartUpload(fileName);
    return res.status(200).json({ uploadId: dataCreated.UploadId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error, try again!' });
  }
}

async function completeMultipartUpload(req, res) {
  try {
    const fileName = req.body.fileName;
    const uploadId = req.body.uploadId;
    const parts = req.body.parts;

    await aws.completeMultipartUpload(fileName, uploadId, parts);
    return res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error: 'Error, try again!' });
  }
}

async function getPresignedUrl(req, res) {
  try {
    const fileName = req.body.fileName;
    const uploadId = req.body.uploadId;
    const partNumber = req.body.partNumber;
    const type = req.body.type;
    let presignedUrl;
    if (type === 'uploadPart') {
      presignedUrl = await aws.generatePresignedUrlWithMultiplePart(fileName, partNumber, uploadId);
    }
    else {
      presignedUrl = await aws.generatePresignedUrl(fileName);
    }

    res.status(200).json({ presignedUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error, try again!' });
  }
}

module.exports = {
  initiateMultipartUpload,
  completeMultipartUpload,
  getPresignedUrl
}