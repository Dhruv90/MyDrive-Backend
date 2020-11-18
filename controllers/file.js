const getStream = require("../gridfs").getStream;
const sharp = require("sharp");
const path = require('path');
const fs = require('fs');
const Folder = require("../models/folder");
const getDb = require('../utilities/getFIlesDb').getDb
const gfs = getStream();
const mongoose = require('mongoose');



exports.postFiles = async (req, res, next) => {
  const uploadThumb = (image) =>
    new Promise((resolve, reject) => {
      const writeStream = gfs.thumb.openUploadStream(image.filename);
      const readStream = gfs.files.openDownloadStreamByName(image.filename);
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

exports.getAllObjects = async (req, res, next) => {
  try {
    const files = await gfs.files.find({"metadata.userId": req.userId}).toArray();
    // const photos = await gfs.files.find({metadata: req.userId}).toArray();
    if (!files || files.length === 0) {
      const err = new Error("No Files Found");
      err.statusCode = 404;
      throw err;
    }
    let resBody = { files: files || null };
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
    let iconPath
    if(extension === 'intro'){
      iconPath = path.join(__dirname,'..','assets','fileIcons',`intro.jpeg`)
    } else {
      iconPath = path.join(__dirname,'..','assets','fileIcons',`${extension}.svg`)
    }
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
  let collection = gfs.files;
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




const deleteFolder = async(folderId, userId) => {
  console.log('Delete Folder Running for: ', folderId);

  const nestedFiles = await gfs.files.find({"metadata.parent": folderId.toString(), "metadata.userId": userId}).toArray();
  console.log("Nested Files: ", nestedFiles);

  for(let i = 0; i<nestedFiles.length; i++){
    await deleteFile(nestedFiles[i]._id, nestedFiles[i].filename)
  }

  const nestedFolders = await Folder.find({parent: folderId});
  console.log("Nested Folders: ", nestedFolders);

  for(let i = 0; i<nestedFolders.length; i++){
    await deleteFolder(nestedFolders[i]._id, userId)
  }

  await Folder.deleteOne({_id: new mongoose.Types.ObjectId(folderId), userId: userId});
  
}

exports.deleteFolderHandler = async (req,res,next) => {
  try{
    const userId = req.userId;
    const folderId = req.body.folderId;
    await deleteFolder(folderId, userId)
    console.log('Folder Deleted');
    res.status(200).json({message: "folder and contents deleted"})

  } catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}

const deleteFile = async (id, filename) => {
  
    console.log("Delete File Running");
    let extension = path.extname(filename).toLowerCase();
    if (extension === ".jpeg" || extension === ".jpg" || extension === ".png") {
      const file = await gfs.thumb.find({ filename: filename }).toArray();
      await gfs.thumb.delete(new mongoose.Types.ObjectId(file[0]._id));
    } 
    await gfs.files.delete(new mongoose.Types.ObjectId(id));
    console.log('File Deleted');
  
}


exports.deleteFileHandler = async (req, res, next) => {
    try {

    const id = req.body.id;
    if (!id) {
        const error = new Error("File not found");
        error.statusCode = 404;
        throw error;
      }
    
    await deleteFile (req.body.id, req.body.filename)
    res.json({ message: "File Deleted" });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.newFolder = async (req, res, next) => {
  try{
    const userId = req.userId;
    const name = req.body.name;
    const parent = req.body.parent;
    const folder = new Folder({
      name: name,
      userId: userId,
      parent: parent
    })
    await folder.save();
    res.status(200).json({message: 'Folder Created'});
  } catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(new Error(err))
  }
}

exports.getFolders = async (req, res, next) => {
  try{
    const userId = req.userId;
    const folders = await Folder.find({userId: userId})
    res.status(200).json({folders: folders});
  } catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}



exports.moveToFolder = async (req, res, next) => {
  try{
    const destinationFolder = req.body.parent;
    const objectId = req.body.objectId;
    const files = await gfs.files.find({_id: new mongoose.Types.ObjectId(objectId)}).toArray();
    if(files.length > 0){
        const filesCollection = getDb().collection('files.files');
        await filesCollection.updateOne({_id: new mongoose.Types.ObjectId(objectId)}, {'$set': {'metadata.parent': destinationFolder}});
        res.status(200).json({message:'File Moved'}) 
    } else {
      const folder = await Folder.find({_id: new mongoose.Types.ObjectId(objectId)})
      if(folder){
        await Folder.updateOne({_id: new mongoose.Types.ObjectId(objectId)}, {parent: destinationFolder}) 
        res.status(200).json({message:'Folder Moved'}) 
      } else {
        throw new Error('File/Folder not found');
      }
    }
  } catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
  
}