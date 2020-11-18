const GridStorage =  require('multer-gridfs-storage');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@nodejscourse-hnpdw.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
let gfs = {}

const storage = new GridStorage({
    url: MONGODB_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
            if (err) {
              return reject(err);
            }
            let extension = path.extname(file.originalname).toLowerCase();
            const filename = buf.toString('hex') + extension;
            const fileInfo = {
              filename: filename,
              bucketName: 'files',
              metadata: {
                userId: req.userId,
                originalname: file.originalname,
                parent: req.body.parent
              }
            };
            if(req.filenames){
              req.filenames.push(filename);
            } else{
              req.filenames = [filename]
            }
            resolve(fileInfo);
          });
        });
      }
});

exports.upload = multer({storage: storage});

exports.streamInit = () => {

  gfs.files = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'files'
  });

  gfs.thumb = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'thumbnails'
  });
    
}

exports.getStream = () => {
    return gfs
}