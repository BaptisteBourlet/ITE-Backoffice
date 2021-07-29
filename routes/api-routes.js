const express = require('express');
const apiCtrl = require('../controller/api-ctrl');
router = express.Router();


router.get('/getSomething', apiCtrl.getSomething);

router.get('/getSequenceResults', apiCtrl.getSequenceResults);

router.get('/getAllProducts', apiCtrl.getAllProducts);

router.get('/getProductDetails', apiCtrl.getProductDetails);

router.post('/getOtherLanguageDetail', apiCtrl.getOtherLanguageDetail);

router.get('/getCategories', apiCtrl.getCategories);

router.get('/getFirstCat', apiCtrl.getFirstCat);

router.get('/getSecondCat', apiCtrl.getSecondCat);

router.get('/getThirdCat', apiCtrl.getThirdCat);

router.post('/addProduct', apiCtrl.addProduct);

router.post('/editProduct', apiCtrl.editProduct);

router.post('/deleteProduct', apiCtrl.deleteProduct)

router.post('/searchProduct', apiCtrl.searchProduct);

router.get('/getProductDet', apiCtrl.getProductDet);

router.post('/addRelatedProduct', apiCtrl.addRelatedProduct);

router.post('/addRelatedProductFromView', apiCtrl.addRelatedProductFromView);

router.post('/getRelatedCatalog', apiCtrl.getRelatedCatalog);

router.post('/changeSequence', apiCtrl.changeSequence);

// router.post('/getAs400Description', apiCtrl.getAs400Description);

router.get('/getAllSeries', apiCtrl.getAllSeries);


module.exports = router;