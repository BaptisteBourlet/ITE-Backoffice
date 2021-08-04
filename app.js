const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api-routes')
PORT = 12080;
app = express();


app.use(express.json());
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/api', apiRoutes);

app.get('/', (req, res) => {
   res.render('mainTab.ejs')
})

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

  app.get('/series-details', function(req, res) {
   res.render('seriesDetails');
 });

 app.get('/ChaptersTranslated', function(req, res) {
   res.render('chaptersTranslated');
 });

app.listen(PORT, () => {
   console.log('listening on port ' + PORT);
})