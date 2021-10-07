const express = require('express');
const apiCtrl = require('../controller/series-ctrl');

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

const imgUpload = multer({ storage: storage });



router.get('/getAllSeries', apiCtrl.getAllSeries);

router.get('/getSerieDetails', apiCtrl.getSerieDetails);

router.post('/searchSerie', apiCtrl.searchSerie);

router.post('/addSeries', apiCtrl.addSeries);

router.post('/deleteSeries', apiCtrl.deleteSeries);

router.post('/editSeries', apiCtrl.editSeries);

router.post('/getOtherLanguageDetailSerie', apiCtrl.getOtherLanguageDetailSerie);

router.get('/getRelatedProductSerie', apiCtrl.getRelatedProductSerie);

router.post('/addSeriesRelatedProduct', apiCtrl.addSeriesRelatedProduct);

router.post('/addRelatedProductFromSeriesView', apiCtrl.addRelatedProductFromSeriesView);

router.post('/deleteSerieRelatedProduct', apiCtrl.deleteSerieRelatedProduct);

router.post('/deleteSerieRelatedProductFromDetailsView', apiCtrl.deleteSerieRelatedProductFromDetailsView);

router.get('/getSerieSpecs', apiCtrl.getSerieSpecs);

router.get('/getSpecGroup', apiCtrl.getSpecGroup);

router.post('/updateSerieSpecs', apiCtrl.updateSerieSpecs);

router.post('/addSerieMasterSpecs', apiCtrl.addSerieMasterSpecs);

router.post('/deleteSeriesMasterSpecs', apiCtrl.deleteSeriesMasterSpecs);

router.post('/addSerieSpecValue', apiCtrl.addSerieSpecValue);

router.get('/getSerieMaster', apiCtrl.getSerieMaster);

router.post('/checkIfSerie', apiCtrl.checkIfSerie);

router.post('/updateSequenceSeriesMaster', apiCtrl.updateSequenceSeriesMaster);

router.get('/getProductDetails', apiCtrl.getProductDetails);

router.get('/getProductDet', apiCtrl.getProductDet);

router.post('/getRelatedCatalog', apiCtrl.getRelatedCatalog);

router.get('/getLinkedImage', apiCtrl.getLinkedImage);

router.post('/updateImageSequence',  apiCtrl.updateImageSequence);

router.post('/uploadSerieImage', imgUpload.single('image'), apiCtrl.uploadSerieImage);


module.exports = router;