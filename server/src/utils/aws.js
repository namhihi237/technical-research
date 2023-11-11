const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.END_POINT,
});

async function createMultipartUpload(fileName) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  };

  return new Promise((resolve, reject) => {
    s3.createMultipartUpload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data)
      }
    });
  });
}


async function completeMultipartUpload(fileName, uploadId, parts) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part) => {
          return {
            ETag: part.ETag,
            PartNumber: part.PartNumber,
          };
        }),
      },
    };

    s3.completeMultipartUpload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data)
      }
    });
  });
}

async function generatePresignedUrl(fileName) {
    const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Expires: 360,
    ContentDisposition: 'inline'
  };

  return s3.getSignedUrl('putObject', params);
}

async function generatePresignedUrlWithMultiplePart(fileName, partNumber, uploadId ) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    PartNumber: partNumber,
    UploadId: uploadId,
  };

  return s3.getSignedUrl('uploadPart', params);
}

async function getSignedUrl(fileName) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  };

  return s3.getSignedUrl('getObject', params);
}

module.exports = {
  createMultipartUpload,
  completeMultipartUpload,
  generatePresignedUrl,
  generatePresignedUrlWithMultiplePart,
  getSignedUrl
}