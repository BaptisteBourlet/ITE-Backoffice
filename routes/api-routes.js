const express = require('express');
const apiCtrl = require('../controller/api-ctrl');
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

// =================================================================================================
//                                           PRODUCTS
// =================================================================================================
router.get('/getSomething', apiCtrl.getSomething);

router.get('/getAllProducts', apiCtrl.getAllProducts);

router.get('/getProductDetails', apiCtrl.getProductDetails);

router.post('/getOtherLanguageDetail', apiCtrl.getOtherLanguageDetail);

router.get('/getCategories', apiCtrl.getCategories);

router.post('/addProduct', apiCtrl.addProduct);

router.post('/editProduct', apiCtrl.editProduct);

router.post('/deleteProduct', apiCtrl.deleteProduct)

router.post('/searchProduct', apiCtrl.searchProduct);

router.get('/getProductDet', apiCtrl.getProductDet);

router.post('/addRelatedProduct', apiCtrl.addRelatedProduct);

router.post('/addRelatedProductFromView', apiCtrl.addRelatedProductFromView);

router.post('/getRelatedCatalog', apiCtrl.getRelatedCatalog);

router.get('/getSequenceResults', apiCtrl.getSequenceResults);

router.post('/changeSequence', apiCtrl.changeSequence);

// =================================================================================================
//                                       SERIES
// =================================================================================================

router.get('/getAllSeries', apiCtrl.getAllSeries);

router.get('/getSerieDetails', apiCtrl.getSerieDetails);

router.post('/searchSerie', apiCtrl.searchSerie);

router.post('/addSeries', apiCtrl.addSeries);

router.post('/deleteSeries', apiCtrl.deleteSeries);

router.post('/editSeries', apiCtrl.editSeries);

router.post('/getOtherLanguageDetailSerie', apiCtrl.getOtherLanguageDetailSerie);

router.get('/getRelatedProductSerie', apiCtrl.getRelatedProductSerie);

router.post('/addSeriesRelatedProduct', apiCtrl.addSeriesRelatedProduct);

router.get('/getSerieSpecs', apiCtrl.getSerieSpecs);

router.get('/getSpecGroup', apiCtrl.getSpecGroup);

router.post('/updateSerieSpecs', apiCtrl.updateSerieSpecs);

router.post('/addSerieMasterSpecs', apiCtrl.addSerieMasterSpecs);

router.post('/addSerieSpecValue', apiCtrl.addSerieSpecValue);

router.get('/getSerieMaster', apiCtrl.getSerieMaster);

router.post('/checkIfSerie', apiCtrl.checkIfSerie);


/* --------------------------- Translted Chapters --------------------------- */

router.get('/getTransltedChapters', apiCtrl.getTransltedChapters);

router.post('/addTranslatedChapter', apiCtrl.addTranslatedChapter);

router.post('/deleteTranslatedChapter', apiCtrl.deleteTranslatedChapter);

router.post('/uploadImage', imgUpload.single('image'), apiCtrl.uploadProductImage);

module.exports = router;