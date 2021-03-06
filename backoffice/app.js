const express = require('express');
var path = require('path');
const bodyParser = require('body-parser');

const assetsRoute = require('./routes/assets-route');

const labelsRoute = require('./routes/labels-route');

const locationsRoute = require('./routes/locations-route');

const manageSequenceRoute = require('./routes/manageSequence-route');

const productRoute = require('./routes/products-route');

const seriesRoute = require('./routes/series-route');

const translatedChaptersRoute = require('./routes/translatedChapters-route');

const spotlightRoute = require('./routes/spotlight-route');

const eventRoute = require('./routes/events-route');

PORT = 12080;
app = express();

// have nested point inlist + css padding left
// login with right to edit
// add photo in htmleditor
// check if translated for all
// chapter transform lowercase done
// check delete assets
// edit cell te-head series

app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use('/', express.static(__dirname + '/views'));

app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', '/@spmeesseman/extjs-pkg-tinymce/resources')));
app.use('/pictures', express.static(__dirname + '/assets'))
app.use('/spotlightPictures', express.static(__dirname + '/assets/images/spotlight'))
app.use('/tinyImages', express.static(__dirname + '/assets/images/tinyImages'))
app.use('/data', express.static(__dirname + '/data'))
app.use('/extjs', express.static(__dirname + '/extjs'))
app.use('/controller', express.static(__dirname + '/controller'));
app.set('view engine', 'ejs');


app.use('/apiAssets', assetsRoute);

app.use('/apiLabels', labelsRoute);

app.use('/apiLocations', locationsRoute);

app.use('/apiManageSequence', manageSequenceRoute);

app.use('/apiProducts', productRoute);

app.use('/apiSeries', seriesRoute);

app.use('/apiTranslatedChapters', translatedChaptersRoute);

app.use('/apiSpotlight', spotlightRoute);

app.use('/apiEvents', eventRoute);

app.get('/', (req, res) => {
   res.render('mainTab.ejs')
})

app.get('/productDetails/:id', function (req, res) {
   
   res.render('productDetails')
});

app.get('/image/:id', function (req, res) {
   
   res.render('imagesForOneProd')
});

app.get('/fr/:id', function (req, res) {
   
   res.render('editFR')
});
app.get('/en/:id', function (req, res) {
   
   res.render('editFR')
});
app.get('/de/:id', function (req, res) {
   
   res.render('editFR')
});
app.get('/es/:id', function (req, res) {
   
   res.render('editFR')
});
app.get('/ru/:id', function (req, res) {
   
   res.render('editFR')
});

app.get('/editLanguages/:id', function (req, res) {
   
   res.render('editLanguages')
});


app.get('/allProducts', (req, res) => {
   res.render('allProducts')
})

app.get('/manage-sequence', function (req, res) {
   res.render('manageSequence');
});

app.get('/series-overview', function (req, res) {
   res.render('allSeries');
});

app.get('/related-series', (req, res) => {
   res.render('SeriesLink');
})

app.get('/series-details', function (req, res) {
   res.render('seriesDetails');
});

app.get('/ChaptersTranslated', function (req, res) {
   res.render('chaptersTranslated');
});

app.get('/assets', function (req, res) {
   res.render('assets');
});

app.get('/labels', function (req, res) {
   res.render('labels');
});

app.get('/locations', function (req, res) {
   res.render('locations');
});

app.get('/spotlight', function (req, res) {
   res.render('spotlight');
});
app.get('/events', function (req, res) {
   res.render('events');
})


const server = app.listen(PORT, () => {
   console.log('listening on port ' + PORT);
})
