
const { DB } = require('../database')
const mysql = require('mysql');
const storage = require('node-sessionstorage');
// const { Connection, Statement } = require('idb-pconnector');


const con = mysql.createConnection({
   host: DB.host,
   user: DB.user,
   password: DB.password,
   database: DB.database,
})


// =================================================================================================
//                                       PRODUCTS
// =================================================================================================

// SELECT * FROM Category WHERE ParentId IN (NULL, 1);
// SELECT * FROM ProductInfo LEFT JOIN SeriesProductLink ON ProductInfo.Id = SeriesProductLink.ProductId WHERE SeriesId = 3;
// SELECT * FROM Category WHERE (ParentId IS NULL OR ParentId = 0) AND Publish = '1';
// SELECT P.Id, P.CODE, PI.Catalog, IT.Type FROM Product LEFT JOIN ProductInfo PI ON P.Id = PI.ProductId LEFT JOIN InfoTree IT ON P.Id = IF.LinkId WHERE IF.Parent = 4;
// UPDATE InfoTree SET Sequence = ${newSequence} WHERE Parent = ${Category} AND LinkId = ${targetId}
// SELECT P.Id, P.CODE, PI.Catalog, IT.Type FROM Product P LEFT JOIN ProductInfo PI ON P.Id = PI.ProductId LEFT JOIN InfoTree IT ON P.Id = IT.LinkId WHERE IT.Parent = 4 AND PI.Language = 'en' AND P.hasDetails = 1;
// con.query(`SELECT MAX(Sequence) FROM RelatedProducts WHERE Type = "${Type}" AND ProductId = ${globalProductID};`)




exports.getSomething = async (req, res) => {

   const query = "SELECT Tree, ProductInfo.ProductId as Id, Catalog, CODE, As400Code, Description"
      + " FROM ProductInfo"
      + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
      + " LEFT JOIN InfoTree ON InfoTree.LinkId = ProductInfo.ProductId AND InfoTree.Type = 'C'"
      + ` WHERE ProductInfo.Language = 'en' ORDER BY ProductInfo.ProductId LIMIT 100;`;
   con.query(query, (err, results, fields) => {
      if (err) throw err;

      res.send(results)
   })
}



// DISTINCT AS400.AOAROM, 
exports.getAllProducts = async (req, res) => {
   const query = "SELECT Tree, ProductInfo.ProductId as Id, Catalog, CODE, As400Code, Description"
      + " FROM ProductInfo"
      + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
      + " LEFT JOIN InfoTree ON InfoTree.LinkId = ProductInfo.ProductId AND InfoTree.Type = 'P'"
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
   const query = "SELECT Catalog, Description, Specification, FullDescription, CODE, As400Code, CategoryId, Publish"
      + " FROM ProductInfo PI LEFT JOIN Product P ON PI.ProductId = P.Id"
      + " LEFT JOIN Assets A ON A.Id = PI.ProductId"
      + ` WHERE PI.ProductId = ${productId} AND Language = 'en'`
   let finalResults = []

   con.query(query, (err, productResults, fields) => {
      if (err) throw err;

      finalResults.push(productResults);
      con.query(`SELECT RP.LinkedProductID, RP.Type, RP.Code, RP.Description FROM ProductInfo PI LEFT JOIN RelatedProducts RP ON PI.ProductId = RP.ProductId WHERE PI.Language = 'en' AND PI.ProductId = ${productId};`, (error, relatedResults, fields) => {
         if (error) throw error;

         finalResults.push(relatedResults);
         res.send(finalResults);
      })
   });
}

exports.getOtherLanguageDetail = async (req, res) => {
   const { productId, language } = req.body;
   const query = `SELECT Catalog, Description, FullDescription, Specification FROM ProductInfo WHERE Language = "${language}" AND ProductId = "${productId}";`;

   con.query(query, (err, results, fields) => {
      if (err) throw err;

      res.status(200).send(results);
   })
}


exports.getCategories = async (req, res) => {
   con.query("SELECT Id, WorkingTitle AS Name FROM Category WHERE Publish = '1'", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

exports.addProduct = async (req, res) => {
   const { Code, As400, CreateOn, Category, Pub, Slug } = req.body;
   console.log(req.body);

   con.query(`INSERT INTO Product (Code, As400Code, CreatedOn, CategoryId, Slug, Publish) VALUES ("${Code}", "${As400}", "${CreateOn}", "${Category}", "${Slug}", "${Pub}");`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }

      let productId = results.insertId;
      storage.setItem('ProdId', productId)

      const { Language, CreatedOn, Description, Specification, Catalog, FullDescription,
         FRLanguage, FRDescription, FRSpecification, FRCatalog, FRFullDescription,
         DELanguage, DEDescription, DESpecification, DECatalog, DEFullDescription,
         SPLanguage, SPDescription, SPSpecification, SPCatalog, SPFullDescription,
         RULanguage, RUDescription, RUSpecification, RUCatalog, RUFullDescription } = req.body;


      if (Catalog !== "" && Description !== "") {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${Language}", "${CreatedOn}", "${productId}", "${Description}", "${Specification}", "${Catalog}", "${FullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
            res.status(200).send(results);
         });
      } else {
         console.log('english wasnt filled in')
      }

      if (FRCatalog !== '' && FRDescription !== '') {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${FRLanguage}", "${CreatedOn}", "${productId}", "${FRDescription}", "${FRSpecification}", "${FRCatalog}", "${FRFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
         });
      } else {
         console.log('french wasnt filled in')
      }

      if (DECatalog !== '' && DEDescription !== '') {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${DELanguage}", "${CreatedOn}", "${productId}", "${DEDescription}", "${DESpecification}", "${DECatalog}", "${DEFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
         });
      } else {
         console.log('german wasnt filled in')
      }

      if (RUCatalog !== '' && RUDescription !== '') {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${RULanguage}", "${CreatedOn}", "${productId}", "${RUDescription}", "${RUSpecification}", "${RUCatalog}", "${RUFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
         });
      } else {
         console.log('russian wasnt filled in')
      }

      if (SPCatalog !== '' && SPDescription !== '') {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${SPLanguage}", "${CreatedOn}", "${productId}", "${SPDescription}", "${SPSpecification}", "${SPCatalog}", "${SPFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
         });
      } else {
         console.log('spanish wasnt filled in')
      }
   })
}

exports.editProduct = async (req, res) => {
   const { ProductId, Pub, Code, As400, Category } = req.body;
   console.log(req.body);
   let errorString = '';
   const ProductQuery = `Update Product SET Code = "${Code}", As400Code = "${As400}", CategoryId = "${Category}", Publish = ${Pub} WHERE Id = ${ProductId};`;

   con.query(ProductQuery, (err, results) => {
      if (err) throw err;

      const { Language, ModifiedOn, Description, Specification, Catalog, FullDescription,
         FRLanguage, FRDescription, FRSpecification, FRCatalog, FRFullDescription,
         DELanguage, DEDescription, DESpecification, DECatalog, DEFullDescription,
         SPLanguage, SPDescription, SPSpecification, SPCatalog, SPFullDescription,
         RULanguage, RUDescription, RUSpecification, RUCatalog, RUFullDescription } = req.body;

      const ENQuery = `UPDATE ProductInfo SET Description = '${Description}', Catalog = '${Catalog}', Specification = '${Specification}', FullDescription = '${FullDescription}' WHERE ProductId = "${ProductId}" AND Language = "en"`;
      const FRQuery = `UPDATE ProductInfo SET Description = '${FRDescription}', Catalog = '${FRCatalog}', Specification = '${FRSpecification}', FullDescription = '${FRFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "fr"`;
      const DEQuery = `UPDATE ProductInfo SET Description = '${DEDescription}', Catalog = '${DECatalog}', Specification = '${DESpecification}', FullDescription = '${DEFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "de"`;
      const SPQuery = `UPDATE ProductInfo SET Description = '${SPDescription}', Catalog = '${SPCatalog}', Specification = '${SPSpecification}', FullDescription = '${SPFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "sp"`;
      const RUQuery = `UPDATE ProductInfo SET Description = '${RUDescription}', Catalog = '${RUCatalog}', Specification = '${RUSpecification}', FullDescription = '${RUFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "en"`;


      if (Description !== "" && Catalog !== "") {
         con.query(ENQuery, (err, result) => {
            if (err) {
               errorString += "English, ";
               console.log(err);
            }

         })
      } else {
         console.log('English wasnt filled in');
      }

      if (FRDescription !== "" && FRCatalog !== "") {
         con.query(FRQuery, (err, result) => {
            if (err) {
               errorString += "French, ";
               console.log(err);
            }

         })
      } else {
         console.log('French wasnt filled in');
      }

      if (DEDescription !== "" && DECatalog !== "") {
         con.query(DEQuery, (err, result) => {
            errorString += "German, ";
            console.log(err);

         })
      } else {
         console.log('German wasnt filled in');
      }

      if (SPDescription !== "" && SPCatalog !== "") {
         con.query(SPQuery, (err, result) => {
            errorString += "Spanish, ";
            console.log(err);

         })
      } else {
         console.log('Spanish wasnt filled in');
      }

      if (RUDescription !== "" && RUCatalog !== "") {
         con.query(RUQuery, (err, result) => {
            errorString += "Russian";
            console.log(err);

         })
      } else {
         console.log('Russian wasnt filled in');
      }

      let finalResult = { ...results, errorString };

      res.send(finalResult);
   })
}



exports.deleteProduct = async (req, res) => {
   const { ProductId } = req.body;
   let errorString = '';

   con.query(`DELETE FROM RelatedProducts WHERE ProductId = ${ProductId} OR LinkedProductID = ${ProductId};`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      console.log('test ' + results)
   })
   con.query(`DELETE FROM ProductInfo WHERE ProductId = ${ProductId};`, (err, results, fields) => {
      if (err) {
         console.log(err);
         errorString += 'ProductInfo, '
      }

      console.log(results);

      con.query(`DELETE FROM Product WHERE Id = "${ProductId}";`, (err, results, fields) => {
         if (err) {
            console.log('Oridyt', err)
            errorString += 'Product, '
         }
         console.log('results', results);
         res.send(results)
      })

   })
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

   const query = "SELECT Product.Id as Id, Description, Catalog, CODE, As400Code, Tree"
      + " FROM ProductInfo"
      + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
      + " LEFT JOIN InfoTree ON ProductInfo.ProductId = InfoTree.LinkId AND InfoTree.Type = 'C'"
      + ` WHERE ProductInfo.Language = 'en' AND ${target} LIKE '%${searchText}%' ORDER BY ProductInfo.ProductId LIMIT 30;`;

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
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

   con.query(`SELECT * FROM Category WHERE ParentId = "${secondCat}" AND Publish = '1';`, (err, results, fields) => {
      if (err) throw err;

      res.send(results)
   })
}


exports.getRelatedCatalog = async (req, res) => {
   let { ProductId } = req.body;
   console.log(ProductId)

   con.query(`SELECT Catalog FROM ProductInfo WHERE ProductId = "${ProductId}" AND Language = 'en';`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.addRelatedProduct = async (req, res) => {
   const { Type, Sequence, LinkedProductID, Catalog, Code } = req.body;
   const ProdId = storage.getItem('ProdId')

   con.query(`INSERT INTO RelatedProducts (Type, Sequence, Code, LinkedProductID, ProductId, Description) VALUES ("${Type}", ${Sequence}, "${Code}", ${LinkedProductID}, ${ProdId}, "${Catalog}");`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}



exports.addRelatedProductFromView = async (req, res) => {
   const { Type, Sequence, productIDGlobal, LinkedProductID, Catalog, Code } = req.body;
   con.query(`SELECT MAX(Sequence) Sequence FROM RelatedProducts WHERE ProductId = "${productIDGlobal}";`, (err, results) => {
      con.query(`INSERT INTO RelatedProducts (Type, Sequence, Code, LinkedProductID, ProductId, Description) VALUES ("${Type}", ${results[0].Sequence + 1}, "${Code}", ${LinkedProductID}, ${productIDGlobal}, "${Catalog}");`, (err, results, fields) => {
         if (err) {
            console.log(err)
         }
         res.send(results)
      })
   })
}


exports.getSequenceResults = async (req, res) => {
   const { CategoryID } = req.query;

   let query = `SELECT IT.Id, IT.Type, IT.Sequence, IT.Sequence AS OldSequence, C.WorkingTitle AS Description FROM InfoTree IT LEFT JOIN Category C ON C.Id = IT.LinkId WHERE IT.Parent =  "${CategoryID}" AND IT.Publish = "1" AND IT.Type = "C"
   UNION
   SELECT  IT.Id, IT.Type,  IT.Sequence, IT.Sequence AS OldSequence, P.CODE AS Description FROM InfoTree IT LEFT JOIN Product P ON P.Id = IT.LinkId WHERE IT.Parent = "${CategoryID}" AND IT.Publish = "1" AND HasDetails = "1" AND IT.Type = "P"
   UNION
   SELECT IT.Id, IT.Type,  IT.Sequence, IT.Sequence AS OldSequence, S.Key AS Description FROM InfoTree IT LEFT JOIN Series S ON S.Sid = IT.LinkId WHERE IT.Parent =  "${CategoryID}" AND IT.Publish = "1" AND IT.Type = "S";`

   con.query(query, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}


exports.changeSequence = async (req, res) => {
   const { Id, Parent, Sequence, Type } = req.body;

   const query = `UPDATE InfoTree SET Sequence = "${Sequence}" WHERE Id = "${Id}" AND Parent = "${Parent}" AND Type = "${Type}";`;

   con.query(query, (err, results) => {
      if (err) throw err;

      res.send('sequence changed');
   })
}

// exports.getAs400Description = async (req, res) => {
//    const {as400Code} = req.body;
//    let schema = 'D#ITF001'
//    let sql = `SELECT AOAROM FROM ${schema}.artikelOverview WHERE ARARNR = "${as400Code}"`;
//    const connection = new Connection({ url: '*LOCAL' })
//    const statement = new Statement(connection);
//    let results = await statement.exec(sql)

//    console.log(results)

//    res.send(results);
// }



// https://www.npmjs.com/package/idb-pconnector

// api-routes.js uncomment line 42
// api-ctrl.js - uncomment exports.getAs400Description - line 414
// allProduct.ejs - check returned object and adapt setValue - line 221


// =================================================================================================
//                                       SERIES
// =================================================================================================

exports.getAllSeries = async (req, res) => {
   const query = "SELECT SeriesInfo.SeriesId as Sid, Title, Series.Key, Tree"
      + " FROM SeriesInfo"
      + " LEFT JOIN Series ON SeriesInfo.SeriesId = Series.Sid"
      + " LEFT JOIN InfoTree ON InfoTree.LinkId = Series.Sid AND InfoTree.Type = 'S'"
      + ` WHERE SeriesInfo.Language = 'en' AND Series.Publish = '1' ORDER BY SeriesInfo.SeriesId LIMIT 100;`;

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.getSerieDetails = async (req, res) => {
   const { serieId } = req.query;
   let finalResults = [];
   const serieQuery = `SELECT Series.Key, Title, FullDescription, Specification FROM SeriesInfo LEFT JOIN Series ON SeriesInfo.SeriesId = Series.Sid WHERE SeriesInfo.SeriesId = "${serieId}" AND SeriesInfo.Language = "en";`;

   const relatedQuery = `SELECT LinkedProductID, Type, Code, Description FROM RelatedProducts WHERE SeriesId = "${serieId}";`

   con.query(serieQuery, (err, serieResults) => {
      if (err) throw err;
      finalResults.push(serieResults);
      con.query(relatedQuery, (error, relatedResults) => {
         if (error) throw error;
         finalResults.push(relatedResults);

         res.send(finalResults);
      })
   })



   // const { productId } = req.query;
   // const query = "SELECT DISTINCT AOAROM, Catalog, Description, Specification, FullDescription, CODE, As400Code, CategoryId, Publish"
   //    + " FROM ProductInfo PI LEFT JOIN Product P ON PI.ProductId = P.Id"
   //    + " LEFT JOIN Assets A ON A.Id = PI.ProductId"
   //    + ` WHERE PI.ProductId = ${productId} AND Language = 'en'`
   // let finalResults = []

   // con.query(query, (err, productResults, fields) => {
   //    if (err) throw err;

   //    finalResults.push(productResults);
   //    con.query(`SELECT RP.LinkedProductID, RP.Type, RP.Code, RP.Description FROM ProductInfo PI LEFT JOIN RelatedProducts RP ON PI.ProductId = RP.ProductId WHERE PI.Language = 'en' AND PI.ProductId = ${productId};`, (error, relatedResults, fields) => {
   //       if (error) throw error;

   //       finalResults.push(relatedResults);
   //       res.send(finalResults);
   //    })
   // });
}


exports.searchSerie = async (req, res) => {
   const { searchQuery } = req.body;

   const query = "SELECT Series.Sid, Series.Key, Title"
      + " FROM SeriesInfo"
      + " LEFT JOIN Series ON Series.Sid = SeriesInfo.SeriesId"
      + ` WHERE SeriesInfo.Language = "en" AND Series.Key LIKE '%${searchQuery}%' AND Series.Publish = "1" ORDER BY SeriesInfo.SeriesId;`;

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.addSeries = async (req, res) => {
   const { Key, CreatedOn } = req.body;
   console.log(req.body);

   con.query(`INSERT INTO Series (Series.Key, CreatedOn, Publish) VALUES ("${Key}", "${CreatedOn}", 1);`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }

      let SeriesId = results.insertId;
      storage.setItem('SeriesId', SeriesId)

      const { Language, CreatedOn, Specification, Title, FullDescription,
         FRLanguage, FRSpecification, FRTitle, FRFullDescription,
         DELanguage, DESpecification, DETitle, DEFullDescription,
         SPLanguage, SPSpecification, SPTitle, SPFullDescription,
         RULanguage, RUSpecification, RUTitle, RUFullDescription } = req.body;


      if (Title !== "") {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${Language}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${Title}", "${Specification}", "${FullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
            res.status(200).send(results);
         });
      } else {
         console.log('english wasnt filled in')
      }

      if (FRTitle !== "") {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${FRLanguage}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${FRTitle}", "${FRSpecification}", "${FRFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
         });
      } else {
         console.log('french wasnt filled in')
      }

      if (DETitle !== "") {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${DELanguage}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${DETitle}", "${DESpecification}", "${DEFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
         });
      } else {
         console.log('german wasnt filled in')
      }

      if (RUTitle !== "") {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${RULanguage}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${RUTitle}", "${RUSpecification}", "${RUFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
         });
      } else {
         console.log('russian wasnt filled in')
      }

      if (SPTitle !== '') {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${SPLanguage}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${SPTitle}", "${SPSpecification}", "${SPFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

            console.log(results);
         });
      } else {
         console.log('spanish wasnt filled in')
      }
   })
}



exports.editSeries = async (req, res) => {
   const { SeriesId, Key, ModifiedOn } = req.body;
   let errorString = '';
   const SeriesQuery = `Update Series SET ModifiedOn = "${ModifiedOn}" WHERE Sid = "${SeriesId}";`;

   con.query(SeriesQuery, (err, results) => {
      if (err) throw err;

      const { ModifiedOn, Title, Specification, FullDescription,
         FRTitle, FRSpecification, FRFullDescription,
         DETitle, DESpecification, DEFullDescription,
         SPTitle, SPSpecification, SPFullDescription,
         RUTitle, RUSpecification, RUFullDescription } = req.body;

      const ENQuery = `UPDATE SeriesInfo SET Title = '${Title}', ModifiedOn = ${ModifiedOn}, Specification = '${Specification}', FullDescription = '${FullDescription}' WHERE SeriesId = "${SeriesId}" AND Language = "en"`;
      const FRQuery = `UPDATE SeriesInfo SET Title = '${FRTitle}', ModifiedOn = ${ModifiedOn}, Specification = '${FRSpecification}', FullDescription = '${FRFullDescription}' WHERE SeriesId = "${SeriesId}" AND Language = "fr"`;
      const DEQuery = `UPDATE SeriesInfo SET Title = '${DETitle}', ModifiedOn = ${ModifiedOn}, Specification = '${DESpecification}', FullDescription = '${DEFullDescription}' WHERE SeriesId = "${SeriesId}" AND Language = "de"`;
      const SPQuery = `UPDATE SeriesInfo SET Title = '${SPTitle}', ModifiedOn = ${ModifiedOn}, Specification = '${SPSpecification}', FullDescription = '${SPFullDescription}' WHERE SeriesId = "${SeriesId}" AND Language = "sp"`;
      const RUQuery = `UPDATE SeriesInfo SET Title = '${RUTitle}', ModifiedOn = ${ModifiedOn}, Specification = '${RUSpecification}', FullDescription = '${RUFullDescription}' WHERE SeriesId = "${SeriesId}" AND Language = "ru"`;

      if (Title !== "") {
         con.query(ENQuery, (err, result) => {
            if (err) {
               errorString += "English, ";
               console.log(err);
            }

         })
      } else {
         console.log('English wasnt filled in');
      }

      if (FRTitle !== "") {
         con.query(FRQuery, (err, result) => {
            if (err) {
               errorString += "French, ";
               console.log(err);
            }

         })
      } else {
         console.log('French wasnt filled in');
      }

      if (DETitle !== "") {
         con.query(DEQuery, (err, result) => {
            errorString += "German, ";
            console.log(err);

         })
      } else {
         console.log('German wasnt filled in');
      }

      if (SPTitle !== "") {
         con.query(SPQuery, (err, result) => {
            errorString += "Spanish, ";
            console.log(err);

         })
      } else {
         console.log('Spanish wasnt filled in');
      }

      if (RUTitle !== "") {
         con.query(RUQuery, (err, result) => {
            errorString += "Russian";
            console.log(err);

         })
      } else {
         console.log('Russian wasnt filled in');
      }

      let finalResult = { ...results, errorString };

      res.send(finalResult);
   })
}



exports.deleteSeries = async (req, res) => {
   const { SeriesId } = req.body;
   let errorString = '';


   con.query(`DELETE FROM SeriesProductLink WHERE SeriesId = ${SeriesId};`, (err, results, fields) => {
      if (err) {
         console.log(err);
         errorString += 'SeriesProductLink, '
      }

   })

   con.query(`DELETE FROM SeriesInfo WHERE SeriesId = ${SeriesId};`, (err, results, fields) => {
      if (err) {
         console.log(err);
         errorString += 'SeriesInfo, '
      }

   })

   con.query(`DELETE FROM Series WHERE Sid = ${SeriesId};`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })

}
exports.getOtherLanguageDetailSerie = async (req, res) => {
   const { serieId, language } = req.body;
   const query = `SELECT Title, FullDescription, Specification FROM SeriesInfo WHERE Language = "${language}" AND SeriesId = "${serieId}";`;
   con.query(query, (err, results, fields) => {
      if (err) throw err;
      res.status(200).send(results);
   })
}


exports.getRelatedProductSerie = async (req, res) => {
   const { serieId } = req.query;

   console.log(serieId);

   const query = `SELECT Product.Id, Product.CODE, ProductInfo.Catalog, SeriesProductLink.SPLid FROM Product LEFT JOIN ProductInfo ON Product.Id = ProductInfo.ProductId LEFT JOIN SeriesProductLink ON SeriesProductLink.ProductId = Product.Id WHERE SeriesProductLink.SeriesId = "${serieId}" AND ProductInfo.Language = "en" ORDER BY SeriesProductLink.Sequence;`;

   con.query(query, (err, results) => {
      if (err) throw err;
      res.status(200).send(results);
   }
   )
}


exports.addSeriesRelatedProduct = async (req, res) => {
   const { ProductId, SeriesId } = req.body;

   con.query(`INSERT INTO SeriesProductLink (ProductId, SeriesId) VALUES ("${ProductId}", "${SeriesId}");`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }

      res.send(results)
   })
}


exports.getSerieSpecs = async (req, res) => {
   const { serieLink } = req.query;

   const query = `SELECT SerieMasterId, Value, Value AS CurrentValue, Name, SeriesProductLinkId FROM SeriesData WHERE SeriesProductLinkId = '${serieLink}';`

   con.query(query, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}


exports.updateSerieSpecs = async (req, res) => {
   const { SerieMasterId, SeriesProductLinkId, Value } = req.body;
   console.log(req.body);

   const query = `UPDATE SeriesData SET Value = "${Value}" WHERE SerieMasterId = "${SerieMasterId}" AND SeriesProductLinkId = "${SeriesProductLinkId}";`

   con.query(query, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}
