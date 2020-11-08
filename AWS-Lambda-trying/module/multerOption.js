const path = require('path');
const multer = require('multer')
const uuid4 = require('uuid4')
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3Config = new AWS.S3({
  accessKeyId:'AKIAIQKI5Y3K56FRLH2A',
  secretAccessKey:'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',
  Bucket:'theraphy-nodejs-awslambd-serverlessdeploymentbuck-na2ptslfmsyq'
});

const uuid = () => {
    const tokens = uuid4().split('-')
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4]
}

const multerOption = multer({
  storage: multerS3({
    s3: s3Config,
    acl: 'public-read',
    bucket: 'theraphy-nodejs-awslambd-serverlessdeploymentbuck-na2ptslfmsyq',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
    destination : function(req, file, cb){    
      cb(null, './tmp/');
    },
    filename : function(req, file, cb){
      var mimeType;
      switch (file.mimetype) {
        case "image/jpeg":
          mimeType = "jpg";
        break;
        case "image/png":
          mimeType = "png";
        break;
        case "image/gif":
          mimeType = "gif";
        break;
        case "image/bmp":
          mimeType = "bmp";
        break;
        default:
          mimeType = "null";
        break;
      }
      cb(null, uuid() + "." + mimeType);
    }
  }),
    //   storage: multer.diskStorage({
    //   destination : function(req, file, cb){    
    //     // cb(null, 'userUpload/');
    //     cb(null, 'tmp/');
    //   },
    //   filename : function(req, file, cb){
    //     var mimeType;
    //     switch (file.mimetype) {
    //       case "image/jpeg":
    //         mimeType = "jpg";
    //       break;
    //       case "image/png":
    //         mimeType = "png";
    //       break;
    //       case "image/gif":
    //         mimeType = "gif";
    //       break;
    //       case "image/bmp":
    //         mimeType = "bmp";
    //       break;
    //       default:
    //         mimeType = "null";
    //       break;
    //     }
    //     cb(null, uuid() + "." + mimeType);
    //   }
    // }),
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024 * 10
    }
})
module.exports = multerOption
