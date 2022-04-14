const express = require('express');
const apiCtrl = require('../controller/events-ctrl');
router = express.Router();
const multer = require('multer');
const appRoot = require('app-root-path');

// multer middleware to upload images
var storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, appRoot + '/assets/images/events')
   },
   filename: function (req, file, cb) {
      cb(null, file.originalname)
   }
})

const imgUpload = multer({ storage: storage });

router.get('/getAllEvents', apiCtrl.getAllEvents);

router.post('/getEventDetail', apiCtrl.getEventDetail);

router.post('/addEvent', imgUpload.array('image', 10), apiCtrl.addEvent);

router.post('/editEvent', imgUpload.array('image', 10), apiCtrl.editEvent);

router.post('/deleteEvent', apiCtrl.deleteEvent);



module.exports = router;