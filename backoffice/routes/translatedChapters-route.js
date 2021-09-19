
const express = require('express');
const apiCtrl = require('../controller/translatedChapters-ctrl');

router = express.Router();
const multer = require('multer');
const appRoot = require('app-root-path');

// multer middleware to upload images
var storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, appRoot + '/assets')
   },
   filename: function (req, file, cb) {
      cb(null, file.originalname)
   }
})

const imgUpload = multer({ storage: storage});


router.get('/getTransltedChapters', apiCtrl.getTransltedChapters);

router.post('/addTranslatedChapter', apiCtrl.addTranslatedChapter);

router.post('/deleteTranslatedChapter', apiCtrl.deleteTranslatedChapter);

router.post('/updateTranslatedChapters', apiCtrl.updateTranslatedChapters);


module.exports = router;