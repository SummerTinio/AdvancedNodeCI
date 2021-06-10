const AWS = require('aws-sdk');
const { response } = require('express');
const uuid = require('uuid/v1');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
})

const upload = function routesForS3Upload (app) {
    app.get('/api/upload', requireLogin, async (req, res) => {
        // use slash in key to enforce "structure" through file names -- even if bucket is just a flat collection
        const extension = 'jpeg';
        // key === File Name for uploaded image
        const fileName = `${req.user.id}/${uuid()}.${extension}`;

        // s3params === BCK!
        const s3params = {
            Bucket: 'evergreen-s3-blog-image-store',
            ContentType: 'image/*',
            Key: fileName
        };
        // the actual request for an AWS preSignedUrl.
        s3.getSignedUrl('putObject', s3params, async (err, preSignedUrl) => {
            // object returned by axios.get('/api/upload', ...) in actions/index.js --
            res.send({ fileName, preSignedUrl });
        });
    });

}

module.exports = upload;