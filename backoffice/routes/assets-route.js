
const express = require('express');
const apiCtrl = require('../controller/assets-ctrl');

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



router.get('/getAssets', apiCtrl.getAssets);

router.get('/getSeriesAssets', apiCtrl.getSeriesAssets);

router.get('/getSeriesDet', apiCtrl.getSeriesDet);

router.post('/updateSequence', apiCtrl.updateSequence);

router.post('/deleteAssets', apiCtrl.deleteAssets);

router.post('/searchAssetsProduct', apiCtrl.searchAssetsProduct);

router.post('/searchAssetsSeries', apiCtrl.searchAssetsSeries);

router.post('/uploadProductImage', imgUpload.single('image'), apiCtrl.uploadProductImage);

router.post('/uploadSerieImage', imgUpload.single('image'), apiCtrl.uploadSerieImage);

router.post('/updateuploadProductImage', imgUpload.single('image'), apiCtrl.updateuploadProductImage);

router.post('/updateuploadSerieImage', imgUpload.single('image'), apiCtrl.updateuploadSerieImage);

router.get('/image', apiCtrl.imageMagick);

router.get('/getProductDet', apiCtrl.getProductDet);

router.post('/convertImages', apiCtrl.convertImages)

module.exports = router;