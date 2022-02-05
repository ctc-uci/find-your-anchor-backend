const s3UploadRouter = require('express-promise-router')();
const aws = require('aws-sdk');
const crypto = require('crypto');

// initialize a S3 instance
const bucketName = process.env.S3_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
});

// get a S3 URL
s3UploadRouter.get('/', async (req, res) => {
  try {
    // generate a unique name for image
    const rawBytes = await crypto.randomBytes(16);
    const imageName = rawBytes.toString('hex');

    // set up s3 params
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Expires: 60,
    };

    // get a s3 upload url
    const uploadURL = await s3.getSignedUrl('putObject', params);
    res.status(200).send(uploadURL);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = s3UploadRouter;
