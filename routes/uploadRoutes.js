const AWS = require('aws-sdk')
const uuid = require('uuid/v1')

const { accessKeyId, secretAccessKey } = require('../config/keys')
const requireLogin = require('../middlewares/requireLogin')

// Configure Amazon S3 SDK module for file upload.
const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region: 'us-east-2'
})

module.exports = app => {
  app.get('/api/upload', requireLogin, (request, response) => {
    // Filename when uploaded to the S3 bucket
    // We can create folders in the bucket by setting up the filename
    // to look like a folder directory.
    const key = `${request.user.id}/${uuid()}.jpeg`

    const params = {
      Bucket: 'bf-node-image-upload',
      ContentType: 'image/jpeg',
      Key: key
    }

    s3.getSignedUrl('putObject', params, (error, url) => {
      response.send({ key, url })
    })
  })
}
