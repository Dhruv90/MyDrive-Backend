const GridStorage =  require('multer-gridfs-storage');
const multer = require('multer');
const mongoose = require('mongoose');
// const Grid = require('gridfs-stream');
const path = require('path');
const crypto = require('crypto');

const MONGODB_URI = 'mongodb+srv://dhruvgupta:OvvXXX6KbBpuoKHC@nodejscourse-hnpdw.mongodb.net/cloud?retryWrites=true&w=majority'
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
            if(extension === '.jpeg' || extension === '.jpg' || extension === '.png'){
              bucket = 'images'
            } else{
              bucket = 'files'
            }
            const filename = buf.toString('hex') + extension;
            const fileInfo = {
              filename: filename,
              bucketName: bucket,
              metadata: {
                userId: req.userId,
                originalname: file.originalname
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

exports.uploadImage = multer({storage: storage});

exports.streamInit = () => {
    // gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.images = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images'
    });
    gfs.thumb = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'thumbnails'
    });
    gfs.files = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'files'
    });
}

exports.getStream = () => {
    return gfs
}