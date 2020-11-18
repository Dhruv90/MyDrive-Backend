const express = require('express');
const fileController = require('../controllers/file');
const gridfs = require('../gridfs');
const isAuth = require('../middleware/is-auth').isAuth

const router = express.Router();

router.post('/upload', isAuth, gridfs.upload.array('files', 30) , fileController.postFiles);

router.post('/newFolder', isAuth, fileController.newFolder);
router.post('/delete', isAuth, fileController.deleteFileHandler);
router.post('/moveToFolder', isAuth, fileController.moveToFolder);
router.post('/deleteFolder', isAuth, fileController.deleteFolderHandler);

router.get('/folders', isAuth, fileController.getFolders);
router.get('/', isAuth, fileController.getAllObjects);
router.get('/thumbnail/:filename', fileController.getThumbImage);
router.get('/icons/:extension', fileController.getFileIcon);
router.get('/:filename', fileController.getFile);


module.exports = router;
