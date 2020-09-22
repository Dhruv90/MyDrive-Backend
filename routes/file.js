const express = require('express');
const fileController = require('../controllers/file');
const gridfs = require('../gridfs');
const isAuth = require('../middleware/is-auth').isAuth

const router = express.Router();

// router.post('/upload', isAuth, gridfs.upload.array('files', 8), fileController.postFiles);
// router.get('/images', isAuth, fileController.getImageObjects);
// router.get('/images/:fileName', fileController.getImage);

router.post('/upload', isAuth, gridfs.uploadImage.array('files', 8), fileController.postFiles);
router.get('/', isAuth, fileController.getAllObjects);
router.get('/thumbnail/:filename', fileController.getThumbImage);
router.get('/icons/:extension', fileController.getFileIcon);
router.get('/:filename',isAuth, fileController.getFile);
router.post('/delete', isAuth, fileController.deleteFile);


module.exports = router;
