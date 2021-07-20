const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api-routes')
PORT = 3000;
app = express();


app.use(express.json());
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));




app.use('/api', apiRoutes);

app.get('/', (req, res) => {
   res.render('allProducts')
})


app.listen(PORT, () => {
   console.log('listening on port ' + PORT);
})