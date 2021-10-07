
const express = require('express');
const apiCtrl = require('../controller/spotlight-ctrl');

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


router.get('/getSpotlight', apiCtrl.getSpotlight);

router.post('/addSpotlight', apiCtrl.addSpotlight);

router.post('/deleteSpotlight', apiCtrl.deleteSpotlight);

router.post('/updateSpotlight', apiCtrl.updateSpotlight);


module.exports = router;