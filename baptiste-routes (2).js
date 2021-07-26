const express = require('express');
const apiCtrl = require('../controller/api-ctrl');
router = express.Router();

// Baptiste getProductDescription

router.post('/addRelatedProduct', apiCtrl.addRelatedProduct);

router.get('/getProductDescription', apiCtrl.getProductDescription);

router.get('/getSomething', apiCtrl.getSomething);

router.get('/getCategories', apiCtrl.getCategories);

router.get('/getAllProducts', apiCtrl.getAllProducts);

router.post('/addProduct', apiCtrl.addProduct);

router.post('/editProduct', apiCtrl.editProduct);

router.post('/deleteProduct', apiCtrl.deleteProduct)

router.get('/getProductDet', apiCtrl.getProductDet)


module.exports = router;