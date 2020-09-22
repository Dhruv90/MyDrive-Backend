const getStream = require("../gridfs").getStream;
const sharp = require("sharp");
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

//  const resize = require('../utilities/resize').resize
const mongoose = require("mongoose");

exports.postFiles = async (req, res, next) => {
  let gfs = getStream();
  const uploadThumb = (image) =>
    new Promise((resolve, reject) => {
      const writeStream = gfs.thumb.openUploadStream(image.filename);
      const readStream = gfs.images.openDownloadStreamByName(image.filename);
      const transformer = sharp().resize(null, 200);
      writeStream.on("finish", resolve);
      readStream.pipe(transformer).pipe(writeStream);
    });

  const uploadThumbs = async (files) => {
    for (let file of files) {
      let extension = path.extname(file.originalname);
      if (
        extension === ".jpeg" ||
        extension === ".jpg" ||
        extension === ".png"
      ) {
        await uploadThumb(file);
      }
    }
  };
  await uploadThumbs(req.files);
  res.status(201).json({ message: "Files Uploaded" });
};

// exports.getImageObjects = async (req, res, next) => {
//   try {
//     const gfs = getStream();
//     const photos = await gfs.images.find().toArray();
//     // const photos = await gfs.files.find({metadata: req.userId}).toArray();
//     if (!photos || photos.length === 0) {
//       const err = new Error("Photos not found");
//       err.statusCode = 404;
//       throw err;
//     }
//     res.status(200).json({ photos: photos });
//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   }
// };

exports.getAllObjects = async (req, res, next) => {
  try {
    const gfs = getStream();
    const photos = await gfs.images.find({"metadata.userId": req.userId}).toArray();
    const files = await gfs.files.find({"metadata.userId": req.userId}).toArray();
    // const photos = await gfs.files.find({metadata: req.userId}).toArray();
    if ((!files || files.length === 0) && (!photos || photos.length === 0)) {
      const err = new Error("No Files Found");
      err.statusCode = 404;
      throw err;
    }
    let resBody = { photos: photos || null, files: files || null };
    // else if ((!files || files.length === 0)){
    //       resBody.files = null
    //   } else if ((!photos || photos.length === 0)){
    //     resBody.photos = null
    //   } else {
    //       resBody.photos = photos;
    //       resBody.files = files;
    //   }
    res.status(200).json(resBody);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getThumbImage = async (req, res, next) => {
  const filename = req.params.filename;
  const gfs = getStream();
  try {
    const file = await gfs.thumb.find({ filename: filename }).toArray();
    if (!file) {
      const err = new Error("File not found");
      err.statusCode = 404;
      throw err;
    }
    const readstream = gfs.thumb.openDownloadStreamByName(filename);
    readstream.pipe(res);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getFileIcon = async (req, res, next) => {
  try{
    const extension = req.params.extension;
    const iconPath = path.join(__dirname,'..','assets','fileIcons',`${extension}.svg`)
    const exists = fs.existsSync(iconPath)
    if(exists){
      res.sendFile(iconPath);
    }
    else {
      res.sendFile(path.join(__dirname,'..','assets','fileIcons',`file.svg`))
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getFile = async (req, res, next) => {
  const filename = req.params.filename;
  let extension = path.extname(filename).toLowerCase();
  const gfs = getStream();
  let collection;
  if (extension === ".jpeg" || extension === ".jpg" || extension === ".png") {
    collection = gfs.images;
  } else {
    collection = gfs.files;
  }
  try {
    const file = await collection.find({ filename: filename, metadata: {userId: req.userId} }).toArray();
    if (!file) {
      const err = new Error("File not found");
      err.statusCode = 404;
      throw err;
    }
    const readstream = collection.openDownloadStreamByName(filename);
    readstream.pipe(res);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteFile = async (req, res, next) => {
    try {
    const gfs = getStream();

    const id = req.body.id;
    if (!id) {
        const error = new Error("File not found");
        error.statusCode = 404;
        throw error;
      }

    const filename = req.body.filename;
    let extension = path.extname(filename).toLowerCase();
    let collection;
    if (extension === ".jpeg" || extension === ".jpg" || extension === ".png") {
      collection = gfs.images;
      const file = await gfs.thumb.find({ filename: filename }).toArray();
      await gfs.thumb.delete(new mongoose.Types.ObjectId(file[0]._id));
    } else {
      collection = gfs.files;
    }
    
    await collection.delete(new mongoose.Types.ObjectId(id));
    res.json({ message: "File Deleted" });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
