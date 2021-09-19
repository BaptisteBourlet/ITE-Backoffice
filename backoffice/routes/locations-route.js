
const express = require('express');
const apiCtrl = require('../controller/locations-ctrl');

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



router.get('/getLocations', apiCtrl.getLocations);

router.post('/addLocations', apiCtrl.addLocations);

router.post('/updateLocations', apiCtrl.updateLocations);

router.post('/deleteLocations', apiCtrl.deleteLocations);

module.exports = router;