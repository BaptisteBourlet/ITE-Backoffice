
const { DB } = require('../database')
const mysql = require('mysql');

const con = mysql.createConnection({
   host: DB.host,
   user: DB.user,
   password: DB.password,
   database: DB.database,
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

exports.getAllProducts = async (req, res) => {
   const query = "SELECT ProductInfo.ProductId as Id, Description, FullDescription, Catalog, CODE, As400Code"
      + " FROM ProductInfo"
      + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
      + ` WHERE ProductInfo.Language = 'en' ORDER BY ProductInfo.ProductId LIMIT 100;`;

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.getProductDetails = async (req, res) => {
   const { productId } = req.query;
   const query = `SELECT Catalog, Description, Specification, FullDescription, CODE, As400Code, CategoryId FROM ProductInfo PI LEFT JOIN Product P ON PI.ProductId = P.Id LEFT JOIN Assets A ON A.Id = PI.ProductId WHERE PI.ProductId = ${productId} AND Language = 'en'`
   let finalResults = []

   con.query(query, (err, productResults, fields) => {
      if (err) throw err;

      finalResults.push(productResults);
      con.query(`SELECT RP.LinkedProductID, RP.Type, RP.Code, RP.Description FROM ProductInfo PI LEFT JOIN RelatedProducts RP ON PI.ProductId = RP.ProductId WHERE PI.Language = 'en' AND PI.ProductId = ${productId};`, (error, relatedResults, fields) => {
         if (error) throw error;
         // console.log(relatedResults);
         finalResults.push(relatedResults);
         res.send(finalResults);
      })
   });
}


exports.getCategories = async (req, res) => {
   con.query("SELECT Id , Name FROM CategoryInfo WHERE Language = 'en'", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

exports.addProduct = async (req, res) => {
   const { Code, As400, CreateOn, Category, Pub, Slug } = req.body;

   console.log(req.body);




   // con.query(`INSERT INTO Product (Code, As400Code, CreatedOn, CategoryId, Slug, Publish) VALUES ("${Code}", "${As400}", "${CreateOn}", "${Category}", "${Slug}", "${Pub}");`, (err, results, fields) => {
   //    if (err) {
   //       console.log(err)
   //    }

   //    let productId = results.insertId;

   //    const { Language, CreatedOn, Description, Specification, Catalog, FullDescription,
   //       FRLanguage, FRDescription, FRSpecification, FRCatalog, FRFullDescription,
   //       GRLanguage, GRDescription, GRSpecification, GRCatalog, GRFullDescription,
   //       SPLanguage, SPDescription, SPSpecification, SPCatalog, SPFullDescription,
   //       RULanguage, RUDescription, RUSpecification, RUCatalog, RUFullDescription } = req.body;

   //    con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES 
   //    ("${Language}", "${CreatedOn}", "${productId}", "${Description}", "${Specification}", "${Catalog}", "${FullDescription}"),
   //    ("${FRLanguage}", "${CreatedOn}", "${productId}", "${FRDescription}", "${FRSpecification}", "${FRCatalog}", "${FRFullDescription}"),
   //    ("${GRLanguage}", "${CreatedOn}", "${productId}", "${GRDescription}", "${GRSpecification}", "${GRCatalog}", "${GRFullDescription}"),
   //    ("${SPLanguage}", "${CreatedOn}", "${productId}", "${SPDescription}", "${SPSpecification}", "${SPCatalog}", "${SPFullDescription}"),
   //    ("${RULanguage}", "${CreatedOn}", "${productId}", "${RUDescription}", "${RUSpecification}", "${RUCatalog}", "${RUFullDescription}");`, (err, results, fields) => {
   //       if (err) {
   //          console.log(err)
   //       }
   //       res.send(results)
   //    })
   // })
}

exports.editProduct = async (req, res) => {

   const { Description, Catalog, FullDescription, Specification, ProductId } = req.body;

   console.log(req.body)
   con.query(`UPDATE ProductInfo SET Description = '${Description}', Catalog = '${Catalog}', FullDescription = '${FullDescription}', Specification = '${Specification}' WHERE ProductId = ${ProductId} AND Language = "en";`, (err, result, field) => {
      if (err) {
         console.log(err);
      }

      console.log(result);
      res.send(result);
   })
}


exports.deleteProduct = async (req, res) => {
   console.log(req.body)
}


exports.getProductDet = async (req, res) => {
   con.query("SELECT CODE, Id FROM Product;", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.searchProduct = async (req, res) => {
   const { searchQuery, searchTarget } = req.body;

   let target = searchTarget === "productCode" ? "Product.Code" : "ProductInfo.Catalog";

   let searchText = target === "Product.Code" ? searchQuery.replace(' ', '-') : searchQuery;

   const query = "SELECT Product.Id as Id, Description, FullDescription, Catalog, CODE, As400Code"
      + " FROM ProductInfo"
      + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
      + ` WHERE ProductInfo.Language = 'en' AND ${target} LIKE '%${searchText}%' ORDER BY ProductInfo.ProductId;`;

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })


}


// SELECT * FROM Category WHERE ParentId IN (NULL, 1);
// SELECT * FROM ProductInfo LEFT JOIN SeriesProductLink ON ProductInfo.Id = SeriesProductLink.ProductId WHERE SeriesId = 3;
// SELECT * FROM Category WHERE (ParentId IS NULL OR ParentId = 0) AND Publish = '1';


exports.getSomething = async (req, res) => {
   con.query("SELECT Catalog, PI.ProductId, RP.Code, RP.Description FROM ProductInfo PI LEFT JOIN RelatedProducts RP ON PI.ProductId = RP.ProductId WHERE PI.Language = 'en' AND PI.ProductId = 2;", (err, results, fields) => {
      if (err) throw err;

      res.send(results)
   })
}

exports.getFirstCat = async (req, res) => {
   con.query("SELECT * FROM Category WHERE (ParentId IS NULL OR ParentId = 0) AND Publish = '1';", (err, results, fields) => {
      if (err) throw err;

      res.send(results)
   })
}

exports.getSecondCat = async (req, res) => {
   const { firstCat } = req.query

   // console.log('firstCat', firstCat);

   con.query(`SELECT * FROM Category WHERE ParentId = "${firstCat}" AND Publish = '1';`, (err, results, fields) => {
      if (err) throw err;

      res.send(results)
   })
}


exports.getThirdCat = async (req, res) => {
   const { secondCat } = req.query
   // console.log('secondCat', secondCat);

   con.query(`SELECT * FROM Category WHERE ParentId = "${secondCat}" AND Publish = '1';`, (err, results, fields) => {
      if (err) throw err;

      res.send(results)
   })
}


exports.getProductDescription = async (req, res) => {
   let { ProdId } = req.body;
   console.log(ProdId)
   console.log(req.body)
   con.query(`SELECT Catalog FROM ProductInfo WHERE ProductId = "${ProdId}" AND Language = 'en';`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.addRelatedProduct = async (req, res) => {
   const {Type, Sequence, LinkedProductID, ProductId, Description } = req.body;
   con.query(`INSERT INTO RelatedProducts (Type, Sequence, LinkedProductID, ProductId) VALUES ("${Type}", ${Sequence} , "${LinkedProductID}", "${ProductId}", "${Description}");`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}