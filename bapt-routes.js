const express = require('express');
const apiCtrl = require('../controller/api-ctrl');
router = express.Router();



router.get('/getSomething', apiCtrl.getSomething);

router.get('/getCategories', apiCtrl.getCategories);

router.get('/getAllProducts', apiCtrl.getAllProducts);

router.post('/addProduct', apiCtrl.addProduct);

router.post('/editProduct', apiCtrl.editProduct);

router.post('/deleteProduct', apiCtrl.deleteProduct)

module.exports = router;