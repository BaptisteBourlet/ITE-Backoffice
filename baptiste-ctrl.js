

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

exports.addProduct = async (req, res) => {
   const {Code, As400, CreateOn, Category, Pub, Slug } = req.body;
   con.query(`INSERT INTO Product (Code, As400Code, CreatedOn, CategoryId, Slug, Publish) VALUES ("${Code}", "${As400}", "${CreateOn}", "${Category}", "${Slug}", "${Pub}");`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      
      let productId = results.insertId;
      
      const {Language, CreatedOn, Description, Specification, Catalog, FullDescription,
         FRLanguage, FRDescription, FRSpecification, FRCatalog, FRFullDescription,
         GRLanguage, GRDescription, GRSpecification, GRCatalog, GRFullDescription,
         SPLanguage, SPDescription, SPSpecification, SPCatalog, SPFullDescription,
         RULanguage, RUDescription, RUSpecification, RUCatalog, RUFullDescription } = req.body;
         
      con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES 
      ("${Language}", "${CreatedOn}", "${productId}", "${Description}", "${Specification}", "${Catalog}", "${FullDescription}"),
      ("${FRLanguage}", "${CreatedOn}", "${productId}", "${FRDescription}", "${FRSpecification}", "${FRCatalog}", "${FRFullDescription}"),
      ("${GRLanguage}", "${CreatedOn}", "${productId}", "${GRDescription}", "${GRSpecification}", "${GRCatalog}", "${GRFullDescription}"),
      ("${SPLanguage}", "${CreatedOn}", "${productId}", "${SPDescription}", "${SPSpecification}", "${SPCatalog}", "${SPFullDescription}"),
      ("${RULanguage}", "${CreatedOn}", "${productId}", "${RUDescription}", "${RUSpecification}", "${RUCatalog}", "${RUFullDescription}");`, (err, results, fields) => {
         if (err) {
            console.log(err)
         }
         
         res.send(results)
         
      })
   })


}

exports.getProductDet = async (req, res) => {
   con.query("SELECT CODE , Id FROM Product;", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}
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