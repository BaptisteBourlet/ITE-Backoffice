
const { DB } = require('../database')
const mysql = require('mysql');
const storage = require('node-sessionstorage');
const multer = require('multer');
const imgUpload = multer({ dest: 'assets/' });
const appRoot = require('app-root-path');
const imageMagick = require('imagemagick');
// imageMagick.convert.path = '/usr/bin/convert';
const con = mysql.createConnection({
   host: DB.host,
   user: DB.user,
   password: DB.password,
   database: DB.database,
   multipleStatements: true
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
// const query = "SELECT Tree, ProductInfo.ProductId as Id, Catalog, CODE, As400Code, Description"
//    + " FROM ProductInfo"
//    + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
//    + " LEFT JOIN InfoTree ON InfoTree.LinkId = ProductInfo.ProductId AND InfoTree.Type = 'C'"
//    + ` WHERE ProductInfo.Language = 'en' ORDER BY ProductInfo.ProductId LIMIT 100;`;



exports.getSomething = async (req, res) => {
   const query = "SELECT SeriesId FROM SeriesProductLink WHERE ProductId = '71'";
   const maxSequence = `SELECT MAX(Sequence) as maxSequence, COUNT(*) AS count FROM SeriesMaster WHERE Sid = "5";`;
   con.query(maxSequence, (err, results) => {
      if (err) throw err;

      let serieId = results[0].SeriesId
      const getSPLid = `SELECT SPLid FROM SeriesProductLink WHERE SeriesId = "5"`;
      con.query(getSPLid, (err, results) => {
         res.send(results);
      })
   })
}



// DISTINCT AS400.AOAROM, 
exports.getAllProducts = async (req, res) => {
   const query = "SELECT Tree, ProductInfo.ProductId as Id, Catalog, CODE, As400Code, Description"
      + " FROM ProductInfo"
      + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
      + " LEFT JOIN InfoTree ON InfoTree.LinkId = ProductInfo.ProductId AND InfoTree.Type = 'P'"
      + ` WHERE ProductInfo.Language = 'en' AND Product.Publish = 1 ORDER BY ProductInfo.ProductId LIMIT 100;`;

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

            res.status(200).send(results);
         });
      } else {
         console.log('english wasnt filled in')
      }

      if (FRCatalog !== '' && FRDescription !== '') {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${FRLanguage}", "${CreatedOn}", "${productId}", "${FRDescription}", "${FRSpecification}", "${FRCatalog}", "${FRFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('french wasnt filled in')
      }

      if (DECatalog !== '' && DEDescription !== '') {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${DELanguage}", "${CreatedOn}", "${productId}", "${DEDescription}", "${DESpecification}", "${DECatalog}", "${DEFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('german wasnt filled in')
      }

      if (RUCatalog !== '' && RUDescription !== '') {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${RULanguage}", "${CreatedOn}", "${productId}", "${RUDescription}", "${RUSpecification}", "${RUCatalog}", "${RUFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('russian wasnt filled in')
      }

      if (SPCatalog !== '' && SPDescription !== '') {
         con.query(`INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${SPLanguage}", "${CreatedOn}", "${productId}", "${SPDescription}", "${SPSpecification}", "${SPCatalog}", "${SPFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('spanish wasnt filled in')
      }
   })
}

exports.editProduct = async (req, res) => {
   const { ProductId, Pub, Code, As400, Category } = req.body;
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

   // con.query(`DELETE FROM RelatedProducts WHERE ProductId = ${ProductId} OR LinkedProductID = ${ProductId};`, (err, results, fields) => {
   //    if (err) {
   //       console.log(err)
   //    }
   // })
   // con.query(`DELETE FROM ProductInfo WHERE ProductId = ${ProductId};`, (err, results, fields) => {
   //    if (err) {
   //       console.log(err);
   //       errorString += 'ProductInfo, '
   //    }

   con.query(`UPDATE Product SET Publish = 0 WHERE Id = "${ProductId}";`, (err, results, fields) => {
      if (err) {
         errorString += 'Product, '
      }
      res.send(results)
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

   let target, searchQueryAdapt;

   switch (searchTarget) {
      case 'productCode':
         target = 'Product.Code';
         searchQueryAdapt = searchQuery.replace(/ /g, '-');
         break;
      case 'Tree':
         target = 'InfoTree.Tree';
         searchQueryAdapt = searchQuery.replace(/ /g, '.');
         break;
      case 'PN':
         target = 'Product.As400Code';
         searchQueryAdapt = searchQuery;
         break;
      case 'productName':
         target = 'ProductInfo.Catalog';
         searchQueryAdapt = searchQuery;
         break;
      case 'AS400':
         target = 'ProductInfo.Description';
         searchQueryAdapt = searchQuery;
         break;
      default:
         target = 'Product.Code';
         searchQueryAdapt = searchQuery;
   }

   const query = "SELECT Product.Id as Id, Description, Catalog, CODE, As400Code, Tree"
      + " FROM ProductInfo"
      + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
      + " LEFT JOIN InfoTree ON ProductInfo.ProductId = InfoTree.LinkId AND InfoTree.Type = 'P'"
      + ` WHERE ProductInfo.Language = 'en' AND Product.Publish = 1 AND ${target} LIKE '%${searchQueryAdapt}%' ORDER BY ProductInfo.ProductId LIMIT 30;`;

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.getRelatedCatalog = async (req, res) => {
   let { ProductId } = req.body;

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


   query = `SELECT IT.Id, IT.Type, IT.Sequence, IT.Sequence AS OldSequence, C.WorkingTitle AS Description FROM InfoTree IT LEFT JOIN Category C ON C.Id = IT.LinkId WHERE IT.Parent =  "${CategoryID}" AND IT.Publish = "1" AND IT.Type = "C"
   UNION
   SELECT IT.Id, IT.Type,  IT.Sequence, IT.Sequence AS OldSequence, P.CODE AS Description FROM InfoTree IT LEFT JOIN Product P ON P.Id = IT.LinkId WHERE IT.Parent = "${CategoryID}" AND IT.Publish = "1" AND HasDetails = "1" AND IT.Type = "P"
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

   const relatedQuery = `SELECT SeriesInfo.Title, LinkedSeriesID, LinkedProductID, Type, Code, Description FROM RelatedProducts
      LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = RelatedProducts.LinkedSeriesID WHERE RelatedProducts.SeriesId = "${serieId}";`

   con.query(serieQuery, (err, serieResults) => {
      if (err) throw err;
      finalResults.push(serieResults);
      con.query(relatedQuery, (error, relatedResults) => {
         if (error) throw error;
         finalResults.push(relatedResults);

         res.send(finalResults);
      })
   })
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
            console.log(err);

            res.status(200).send(results);
         });
      } else {
         console.log('english wasnt filled in')
      }

      if (FRTitle !== "") {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${FRLanguage}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${FRTitle}", "${FRSpecification}", "${FRFullDescription}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('french wasnt filled in')
      }

      if (DETitle !== "") {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${DELanguage}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${DETitle}", "${DESpecification}", "${DEFullDescription}");`, (err, results, fields) => {
            if (err) throw err;
            console.log(err);

         });
      } else {
         console.log('german wasnt filled in')
      }

      if (RUTitle !== "") {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${RULanguage}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${RUTitle}", "${RUSpecification}", "${RUFullDescription}");`, (err, results, fields) => {
            if (err) throw err;
            console.log(err);

         });
      } else {
         console.log('russian wasnt filled in')
      }

      if (SPTitle !== '') {
         con.query(`INSERT INTO SeriesInfo (Language, CreatedOn, SeriesId, Title, Specification, FullDescription) VALUES ("${SPLanguage}", "${CreatedOn}", "${storage.getItem('SeriesId')}", "${SPTitle}", "${SPSpecification}", "${SPFullDescription}");`, (err, results, fields) => {
            if (err) throw err;
            console.log(err);

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

   const query = "SELECT Product.Id, Product.CODE, ProductInfo.Catalog, SeriesProductLink.SPLid, SeriesData.Key, SeriesData.Value FROM Product"
      + " LEFT JOIN ProductInfo ON Product.Id = ProductInfo.ProductId"
      + " LEFT JOIN SeriesProductLink ON SeriesProductLink.ProductId = Product.Id"
      + " LEFT JOIN SeriesData ON SeriesProductLink.SPLid = SeriesData.SeriesProductLinkId"
      + ` WHERE SeriesProductLink.SeriesId = "${serieId}" AND ProductInfo.Language = "en" ORDER BY SeriesProductLink.Sequence;`;

   con.query(query, (err, results, fields) => {
      if (err) throw err;

      let idArray = [];
      let result = [];
      results.forEach(res => {
         if (!idArray.includes(res.Id)) {
            idArray.push(res.Id);
         }
      })

      for (let i = 0; i < idArray.length; i++) {
         let obj = {};
         for (const { Id, Key, Value, CODE, Catalog, SPLid } of results) {
            if (Id === idArray[i]) {
               obj.id = Id;
               obj.Code = CODE;
               obj.Name = Catalog;
               obj.SPLid = SPLid;
               obj[Key] = Value;
            }
         }
         result.push(obj);
      }
      res.send(result)
   })
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
   const { SPLid, key, value } = req.body;

   const query = `UPDATE SeriesData SET Value = '${value}' WHERE SeriesData.Key = '${key}' AND SeriesProductLinkId = '${SPLid}';`

   con.query(query, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}

exports.addSerieMasterSpecs = async (req, res) => {
   const { serieId, Key, Group, SubGroup } = req.body;
   let nextSequence;
   let nextSerieCount;
   const maxSequence = `SELECT MAX(Sequence) as maxSequence, COUNT(*) AS count FROM SeriesMaster WHERE Sid = "${serieId}";`;
   const masterInsert = `INSERT INTO SeriesMaster (SeriesMaster.Sid, SeriesMaster.Key, SeriesMaster.Group, SubGroup, Sequence) VALUES ('${serieId}', '${Key}', '${Group}', '${SubGroup}', '${nextSequence}');`;
   const getSPLid = `SELECT SPLid FROM SeriesProductLink WHERE SeriesId = "${serieId}"`;


   con.query(maxSequence, (err, sequenceResult) => { // get maxSequence from SeriesMaster
      if (err) throw err;
      nextSequence = sequenceResult[0].maxSequence + 1;
      nextSerieCount = sequenceResult[0].count + 1;
      con.query(masterInsert, (err, result) => { // insert into SeriesMaster
         if (err) throw err;
         let newSerieMasterId = result.insertId;

         con.query(getSPLid, (err, SPLresults) => { // get all SeriesProductLinkIds
            if (err) throw err;

            SPLresults.forEach((serieProductLink) => { //insert evert SerieProductLink to SeriesData
               const insertToData = `INSERT INTO SeriesData (SerieMasterId, Value, SeriesProductLinkId, SeriesData.Key, SeriesData.Group, Sequence, Name) VALUES ("${newSerieMasterId}", " ", "${serieProductLink.SPLid}", "${Key}", "${Group}", "${nextSerieCount}", "${Key}");`

               con.query(insertToData, (err, result) => {
                  if (err) throw err;
               })
            })

            res.send(SPLresults);
         })
      })
   })
}

exports.getSpecGroup = async (req, res) => {
   const query = `SELECT DISTINCT SeriesMaster.Group FROM SeriesMaster;`
   con.query(query, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}



/* ------------------------------- SeriesMaster ------------------------------ */


exports.getSerieMaster = async (req, res) => {
   const { Sid } = req.query;

   const query = `SELECT SeriesMaster.Id, SeriesMaster.Key, SeriesMaster.Group, Sequence FROM SeriesMaster WHERE Sid = ${Sid};`

   con.query(query, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}

exports.addSerieSpecValue = async (req, res) => {
   const { Key, Value, Group, SubGroup, SeriesMasterId } = req.body;

   console.log(req.body);
}


exports.checkIfSerie = async (req, res) => {
   const { productId } = req.body;
   const query = `SELECT SeriesId FROM SeriesProductLink WHERE ProductId = '${productId}'`;

   con.query(query, (err, result) => {
      if (err) throw err;

      if (result[0] !== undefined) {
         res.send({ isSerie: true, serieId: result[0].SeriesId });
      } else {
         res.send({ isSerie: false });
      }
   })
}

/* ------------------------- TranslatedChapter CRUD ------------------------- */

exports.getTransltedChapters = async (req, res) => {
   const query = 'SELECT * FROM TranslatedChapters ORDER BY Chapter;'


   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}

exports.addTranslatedChapter = async (req, res) => {
   const { Chapter, Language, Translated } = req.body;

   con.query(`INSERT INTO TranslatedChapters (Chapter, Language, Translated) VALUES ("${Chapter}", "${Language}", "${Translated}");`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}



exports.deleteTranslatedChapter = async (req, res) => {
   const { chapterTransltedId } = req.body;

   con.query(`DELETE FROM TranslatedChapters WHERE id = ${chapterTransltedId};`, (err, results, fields) => {
      if (err) {
         console.log(err);
      }
      res.send(results)
   })
}

exports.updateTranslatedChapters = async (req, res) => {
   const { id, Chapter, Language, Translated } = req.body;

   const query = `UPDATE TranslatedChapters SET Chapter = '${Chapter}', Language = '${Language}', Translated = '${Translated}' WHERE id = ${id};`

   con.query(query, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}

/* ------------------------------- CRUD ASSETS ------------------------------ */

exports.getAssets = async (req, res) => {
   const query = 'SELECT Assets.Id, Assets.ProductId, Type, Path, Label, Sequence, Product.CODE, ProductInfo.Catalog FROM Assets'
      + " LEFT JOIN Product ON Product.Id = Assets.ProductId"
      + " LEFT JOIN ProductInfo ON ProductInfo.ProductId = Product.Id WHERE ProductInfo.Language = 'en' ORDER BY Assets.ProductId;"

   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}

exports.getSeriesAssets = async (req, res) => {
   const query = 'SELECT Assets.Id, Assets.SerieId, Type, Path, Label, Sequence, Series.Key, SeriesInfo.Title FROM Assets'
      + " LEFT JOIN Series ON Series.Sid = Assets.SerieId"
      + " LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = Series.Sid WHERE SeriesInfo.Language = 'en' ORDER BY Assets.SerieId;"

   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}

exports.addAssets = async (req, res) => {
   const { ProductId, SerieId, Type, Path, Label, Sequence } = req.body;


   con.query(`INSERT INTO Assets (ProductId, SerieId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "${SerieId}", "${Type}", "${Path}", "${Label}", "${Sequence}");`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

exports.getSeriesDet = async (req, res) => {
   const query = 'SELECT Sid AS Id, Series.Key AS CODE FROM Series;'

   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}

exports.updateSequence = async (req, res) => {
   const { Id, Sequence } = req.body;

   const query = `UPDATE Assets SET Sequence = ${Sequence} WHERE Id = ${Id};`

   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}

exports.deleteAssets = async (req, res) => {
   const { Id } = req.body;

   con.query(`DELETE FROM Assets WHERE id = ${Id};`, (err, results, fields) => {
      if (err) {
         console.log(err);
      }
      res.send(results)
   })
}
// upload and save image done by upload middleware, check api-routes.
// after image saved, it will be resized and paths will be saved to Assets database here 
exports.uploadProductImage = async (req, res) => {
   let nextSequence, landscape;
   const { originalname } = req.file;
   const { ProductId, Label } = req.body;
   const maxSequence = `SELECT MAX(Sequence) AS maxSequence FROM Assets WHERE ProductId = "${ProductId}"`;
   const imageSizes = [
      {
         size: 'large',
         width: 1280,
         height: 1280
      },
      {
         size: 'medium',
         width: 800,
         height: 800
      },
      {
         size: 'small',
         width: 400,
         height: 400,
      },
      {
         size: 'thumb',
         width: 200,
         height: 200,
      },
   ]


   con.query(maxSequence, (err, result) => {
      if (err) throw err;
      nextSequence = result[0].maxSequence + 1;


      const insertAssets = `INSERT INTO Assets (ProductId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "product-image", "${originalname}", "${Label}", "${nextSequence}");`

      // insert original size
      con.query(insertAssets, (err, result) => {
         if (err) throw err;

      })

      // Check if image is landscape;
      imageMagick.identify(`${appRoot}/assets/${originalname}`, (err, features) => {
         if (err) {
            console.log('imageMagick', err);
         }
         landscape = features.width > features.height ? true : false;

         // insert other sizes
         imageSizes.forEach(size => {
            let newName = originalname.split('.');
            newName[0] = `${newName[0]}-${size.size}`;
            newName = newName.join('.');

            let options = {
               srcPath: `${appRoot}/assets/${originalname}`,
               dstPath: `${appRoot}/assets/${newName}`,
            }

            // set maxWidth or maxHeight depending on image type
            if (landscape) {
               options.width = size.width;
            } else {
               options.height = size.height;
            }

            imageMagick.resize(options, function (err, stdout, sdterr) {
               if (err) throw err;
               const insertAssets = `INSERT INTO Assets (ProductId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "product-image", "${newName}", "${Label}", "${nextSequence}");`

               con.query(insertAssets, (err, result) => {
                  if (err) throw err;

                  if (size.size === "large") {
                     res.status(200).send({ ...result, success: true, file: originalname });
                  }
               })
            });
         })
      })
   })
}


// upload and save image done by upload middleware, check api-routes.
// after image saved, it will be resized and paths will be saved to Assets database here 
exports.uploadSerieImage = async (req, res) => {
   let nextSequence, landscape;
   const { originalname } = req.file;
   const { SeriesId, Label } = req.body;
   const maxSequence = `SELECT MAX(Sequence) AS maxSequence FROM Assets WHERE SerieId = "${SeriesId}"`;
   const imageSizes = [
      {
         size: 'large',
         width: 1280,
         height: 1280
      },
      {
         size: 'medium',
         width: 800,
         height: 800
      },
      {
         size: 'small',
         width: 400,
         height: 400,
      },
      {
         size: 'thumb',
         width: 200,
         height: 200,
      },
   ]

   con.query(maxSequence, (err, result) => {
      if (err) throw err;
      nextSequence = result[0].maxSequence + 1;


      const insertAssets = `INSERT INTO Assets (SerieId, Type, Path, Label, Sequence) VALUES ("${SeriesId}", "serie-image", "${originalname}", "${Label}", "${nextSequence}");`

      // insert original size
      con.query(insertAssets, (err, result) => {
         if (err) throw err;

      })

      // Check if image is landscape;
      imageMagick.identify(`${appRoot}/assets/${originalname}`, (err, features) => {
         if (err) {
            console.log('imageMagick', err);
         }
         landscape = features.width > features.height ? true : false;

         // insert other sizes
         imageSizes.forEach(size => {
            let newName = originalname.split('.');
            newName[0] = `${newName[0]}-${size.size}`;
            newName = newName.join('.');

            let options = {
               srcPath: `${appRoot}/assets/${originalname}`,
               dstPath: `${appRoot}/assets/${newName}`,
            }

            // set maxWidth or maxHeight depending on image type
            if (landscape) {
               options.width = size.width;
            } else {
               options.height = size.height;
            }

            imageMagick.resize(options, function (err, stdout, sdterr) {
               if (err) throw err;
               const insertAssets = `INSERT INTO Assets (SerieId, Type, Path, Label, Sequence) VALUES ("${SeriesId}", "serie-image", "${newName}", "${Label}", "${nextSequence}");`

               con.query(insertAssets, (err, result) => {
                  if (err) throw err;

                  if (size.size === "large") {
                     res.status(200).send({ ...result, success: true, file: originalname });
                  }
               })
            });
         })
      })
   })
}



exports.imageMagick = async (req, res) => {
   imageMagick.identify(appRoot + '/assets/doge.jpg', (err, features) => {
      if (err) {
         console.log('imageMagick', err);
      }
      // console.log(features);
      console.log(features.width > features.height);

      res.send(features);
   })

   // imageMagick.convert([appRoot + '/assets/doge.jpg', '-resize', '25x120', 'doge-small.jpg'],
   //    function (err, stdout) {
   //       if (err) throw err;
   //       console.log('stdout:', stdout);
   //    });

   // const options = {
   //    srcPath: appRoot + '/assets/doge.jpg',
   //    dstPath: appRoot + '/assets/doge-large.jpg',
   //    width: 200,
   //    // quality: 0.8,
   //    // format: 'jpg',
   //    // progressive: false,
   //    // srcData: appRoot + '/assets/doge-small.jpg',
   //    // srcFormat: null,
   //    // height: 0,
   //    // strip: true,
   //    // filter: 'Lagrange',
   //    // sharpening: 0.2,
   //    // customArgs: []
   // }
   // imageMagick.resize(options, function (err, stdout, sdterr) {
   //    if (err) throw err;
   //    console.log('stdout:', stdout);
   //    console.log('sdterr:', sdterr);
   // });
}