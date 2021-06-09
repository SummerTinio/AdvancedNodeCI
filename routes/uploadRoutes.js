const AWS = require('aws-sdk');
const { response } = require('express');
const uuid = require('uuid/v1');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
})

const upload = function routesUsedToUploadToS3 (app) {
    app.get('/api/upload', requireLogin, async (req, res) => {
        // use slash in key to enforce "structure" through file names -- even if bucket is just a flat collection
        const extension = 'jpeg';
        // key === File Name for uploaded image
        const key = `${req.user.id}/${uuid()}.${extension}`;

        // s3params === BCK!
        const s3params = {
            Bucket: 'evergreen-s3-blog-image-store',
            ContentType: 'jpeg',
            Key: key
        };

        s3.getSignedUrl('putObject', s3params, async (err, url) => {
            res.send({ key, url });
        });
    });

}

module.exports = upload;