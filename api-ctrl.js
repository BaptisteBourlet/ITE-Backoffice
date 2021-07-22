

const mysql = require('mysql');

const con = mysql.createConnection({
   host: '51.254.46.89',
   user: 'lap',
   password: '3*Ou2bo3',
   database: 'cdinvest_ITE',
})

// con.connect((err) => {
//    if (err) {
//       console.log(err);
//    };

//    console.log('MYSQL database connected');
//    // con.query("SELECT * FROM ProductInfo;", (err, results, fields) => {
//    //    if (err) {
//    //       console.log(err)
//    //    }

//    //    console.log(results);
//    // })
// })

exports.getCategories = async (req, res) => {
   con.query("SELECT Id , Name FROM CategoryInfo WHERE Language = 'en'", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

exports.getAllProducts = async (req, res) => {
   con.query("SELECT DISTINCT ProductInfo.Id as Id, Description, FullDescription, Catalog, Path FROM ProductInfo LEFT JOIN Assets ON ProductInfo.Id = Assets.ProductId;", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.addProduct = async (req, res) => {
   console.log(req.body)
}

exports.editProduct = async (req, res) => {
   console.log(req.body)
}


exports.deleteProduct = async (req, res) => {
   console.log(req.body)
}


exports.getSomething = async (req, res) => {
   con.query("SELECT * FROM ProductInfo LEFT JOIN SeriesProductLink ON ProductInfo.Id = SeriesProductLink.ProductId WHERE SeriesId = 3;", (err, results, fields) => {
      if (err) throw err;

      res.send(results)
   })
}