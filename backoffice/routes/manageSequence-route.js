const express = require('express');
const apiCtrl = require('../controller/manageSequence-ctrl');

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

router.get('/getCategories', apiCtrl.getCategories);

router.get('/getSequenceResults', apiCtrl.getSequenceResults);

router.post('/changeSequence', apiCtrl.changeSequence);

router.post('/addCategory', apiCtrl.addCategory);

router.post('/getOtherLanguageDetail', apiCtrl.getOtherLanguageDetail);

router.post('/deleteCategory', apiCtrl.deleteCategory);


module.exports = router;