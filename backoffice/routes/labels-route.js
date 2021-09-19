
const express = require('express');
const apiCtrl = require('../controller/labels-ctrl');

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


router.get('/getLabels', apiCtrl.getLabels);

router.post('/updateLabels', apiCtrl.updateLabels);

router.post('/DeleteLabels', apiCtrl.DeleteLabels);

router.post('/addLabels', apiCtrl.addLabels);

router.post('/getLabelsDetails', apiCtrl.getLabelsDetails);

router.post('/searchLabels', apiCtrl.searchLabels);

module.exports = router;