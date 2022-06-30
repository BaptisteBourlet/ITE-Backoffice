const express = require('express');
const apiCtrl = require('../controller/products-ctrl');

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


router.get('/getAllProducts', apiCtrl.getAllProducts);

router.get('/getProductDetails', apiCtrl.getProductDetails);

router.post('/getOtherLanguageDetail', apiCtrl.getOtherLanguageDetail);

router.get('/getCategories', apiCtrl.getCategories);

router.post('/addProduct', apiCtrl.addProduct);

router.post('/editProduct', apiCtrl.editProduct);

router.post('/editOnelanguage', apiCtrl.editOnelanguage);

router.post('/uploadTinyMceImage', apiCtrl.uploadTinyMceImage);

// router.post('/redirectDetails', apiCtrl.redirectDetails);

router.post('/deleteProduct', apiCtrl.deleteProduct)

router.post('/searchProduct', apiCtrl.searchProduct);

router.post('/installation', apiCtrl.installation);

router.get('/getProductDet', apiCtrl.getProductDet);

router.post('/addRelatedProduct', apiCtrl.addRelatedProduct);

router.post('/addRelatedProductFromView', apiCtrl.addRelatedProductFromView);

router.post('/getRelatedCatalog', apiCtrl.getRelatedCatalog);

router.get('/getSequenceResults', apiCtrl.getSequenceResults);

router.post('/changeSequence', apiCtrl.changeSequence);

router.post('/deleteSerieRelatedProductFromDetailsView', apiCtrl.deleteSerieRelatedProductFromDetailsView);

router.post('/checkIfSerie', apiCtrl.checkIfSerie);

router.get('/getRelatedProductSerie', apiCtrl.getRelatedProductSerie);

router.post('/updateSerieSpecs', apiCtrl.updateSerieSpecs);

router.post('/uploadProductImage', imgUpload.single('image'), apiCtrl.uploadProductImage);

router.get('/getLinkedImage', apiCtrl.getLinkedImage);

router.post('/updateImageSequence',  apiCtrl.updateImageSequence);

module.exports = router;