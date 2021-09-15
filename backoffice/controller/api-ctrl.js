
const { DB } = require('../database')
const mysql = require('mysql');
const storage = require('node-sessionstorage');
const multer = require('multer');
const appRoot = require('app-root-path');
const imageMagick = require('imagemagick');

const imagemagickCli = require('imagemagick-cli');

// imageMagick.convert.path = '/usr/bin/convert';
const con = mysql.createConnection({
   host: DB.host,
   user: DB.user,
   password: DB.password,
   database: DB.database,
   multipleStatements: true
})

const LANGUAGES = ['en', 'de', 'es', 'fr', 'ru'];

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
   const query = "SELECT Tree, ProductInfo.ProductId as Id, Catalog, CODE, As400Code, Description, SeriesProductLink.ProductId AS SProductId"
      + " FROM ProductInfo"
      + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
      + " LEFT JOIN InfoTree ON InfoTree.LinkId = ProductInfo.ProductId AND InfoTree.Type IN ('P') AND InfoTree.Tree != ''"
      + " LEFT JOIN SeriesProductLink ON SeriesProductLink.ProductId = Product.Id"
      + " LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = SeriesProductLink.SeriesId AND SeriesInfo.Language = 'en'"
      + ` WHERE ProductInfo.Language = 'en' AND Product.Publish = 1 ORDER BY ProductInfo.ProductId;`;

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}



// exports.getAllProductsTranslations = async (req, res) => {
//    const query = "SELECT Tree, ProductInfo.Language, ProductInfo.ProductId as Id, Catalog, CODE, As400Code, Description, SeriesProductLink.ProductId AS SProductId"
//       + " FROM ProductInfo"
//       + " LEFT JOIN Product ON ProductInfo.ProductId = Product.Id"
//       + " LEFT JOIN InfoTree ON InfoTree.LinkId = ProductInfo.ProductId AND InfoTree.Type IN ('P') AND InfoTree.Tree != ''"
//       + " LEFT JOIN SeriesProductLink ON SeriesProductLink.ProductId = Product.Id"
//       + " LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = SeriesProductLink.SeriesId AND SeriesInfo.Language = 'en'"
//       + ` WHERE ProductInfo.Language = 'en' AND Product.Publish = 1 ORDER BY ProductInfo.ProductId;`;



//    con.query(query, (err, results, fields) => {
//       if (err) {
//          console.log(err)
//       }
//       let finalResult = results
//       var translatedArray = []
//       var count = finalResult.length
//       for (var i = 0; i < finalResult.length; i++) {

//          con.query(`SELECT Language, ProductId FROM ProductInfo WHERE ProductInfo.ProductId = ${finalResult[i].Id};`, (error, translatedResults, fields) => {
//             if (error) throw error;
//             for (var x = 0; x < translatedResults.length; x++) {

//                if (translatedResults[x].Language == 'en') {
//                   finalResult.Translated = translatedArray.join(', ')
//                   translatedArray = []
//                   translatedArray.push(translatedResults[x].Language)

//                   //console.log(finalResult.Translated)
//                } else {
//                   translatedArray.push(translatedResults[x].Language)

//                }
//             }
//             if (i == count){
//                console.log('test i : '+ i)
//             }
//          })
//       }

//       res.send(finalResult)
//    })
// }


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
   con.query("SELECT C.Id, C.WorkingTitle AS Name, IT.Tree FROM Category C LEFT JOIN InfoTree IT ON C.Id = IT.LinkId and IT.Publish = '1' and IT.Type = 'C' WHERE C.Publish = '1'", (err, results, fields) => {
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
         FRLanguage, FrDetails, FRDescription, FRSpecification, FRCatalog, FRFullDescription,
         DELanguage, DeDetails, DEDescription, DESpecification, DECatalog, DEFullDescription,
         SPLanguage, EsDetails, SPDescription, SPSpecification, SPCatalog, SPFullDescription,
         RULanguage, RuDetails, RUDescription, RUSpecification, RUCatalog, RUFullDescription } = req.body;

      const ENQuery = `UPDATE ProductInfo SET Description = '${Description}', Catalog = '${Catalog}', Specification = '${Specification}', FullDescription = '${FullDescription}' WHERE ProductId = "${ProductId}" AND Language = "en"`;
      const FRQuery = `UPDATE ProductInfo SET Description = '${FRDescription}', Catalog = '${FRCatalog}', Specification = '${FRSpecification}', FullDescription = '${FRFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "fr"`;
      const DEQuery = `UPDATE ProductInfo SET Description = '${DEDescription}', Catalog = '${DECatalog}', Specification = '${DESpecification}', FullDescription = '${DEFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "de"`;
      const SPQuery = `UPDATE ProductInfo SET Description = '${SPDescription}', Catalog = '${SPCatalog}', Specification = '${SPSpecification}', FullDescription = '${SPFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "sp" OR Language = "es"`;
      const RUQuery = `UPDATE ProductInfo SET Description = '${RUDescription}', Catalog = '${RUCatalog}', Specification = '${RUSpecification}', FullDescription = '${RUFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "ru"`;

      const FrQueryInsert = `INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${FRLanguage}", "${ModifiedOn}", "${ProductId}", "${FRDescription}", "${FRSpecification}", "${FRCatalog}", "${FRFullDescription}");`
      const DeQueryInsert = `INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${DELanguage}", "${ModifiedOn}", "${ProductId}", "${DEDescription}", "${DESpecification}", "${DECatalog}", "${DEFullDescription}");`
      const EsQueryInsert = `INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${SPLanguage}", "${ModifiedOn}", "${ProductId}", "${SPDescription}", "${SPSpecification}", "${SPCatalog}", "${SPFullDescription}");`
      const RuQueryInsert = `INSERT INTO ProductInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${RULanguage}", "${ModifiedOn}", "${ProductId}", "${RUDescription}", "${RUSpecification}", "${RUCatalog}", "${RUFullDescription}");`

      if (Description !== "" && Catalog !== "") {
         con.query(ENQuery, (err, results) => {
            if (err) {
               errorString += "English, ";
               console.log(err);
            }

         })
      } else {
         console.log('English wasnt filled in');
      }
      if (FrDetails == 'false' && FRDescription !== "" && FRCatalog !== "") {
         console.log('Fr Insert sql')
         con.query(FrQueryInsert, (err, results) => {
            if (err) {
               errorString += "French, ";
               console.log(err);
            }

         })
      } else {

         if (FRDescription !== "" && FRCatalog !== "") {
            con.query(FRQuery, (err, results) => {
               if (err) {
                  errorString += "French, ";
                  console.log(err);
               }

            })
         } else {
            console.log('French wasnt filled in');
         }
      }

      if (DeDetails == 'false' && DEDescription !== "" && DECatalog !== "") {
         con.query(DeQueryInsert, (err, results) => {
            if (err) {
               errorString += "German, ";
               console.log(err);
            }

         })
      } else {

         if (DEDescription !== "" && DECatalog !== "") {
            con.query(DEQuery, (err, results) => {
               errorString += "German, ";
               console.log(err);

            })
         } else {
            console.log('German wasnt filled in');
         }
      }

      if (EsDetails == 'false' && SPDescription !== "" && SPCatalog !== "") {
         con.query(EsQueryInsert, (err, results) => {
            if (err) {
               errorString += "Spanish, ";
               console.log(err);
            }

         })
      } else {
         if (SPDescription !== "" && SPCatalog !== "") {
            con.query(SPQuery, (err, results) => {
               errorString += "Spanish, ";
               console.log(err);

            })
         } else {
            console.log('Spanish wasnt filled in');
         }
      }

      if (RuDetails == 'false' && RUDescription !== "" && RUCatalog !== "") {
         con.query(RuQueryInsert, (err, results) => {
            if (err) {
               errorString += "Russian, ";
               console.log(err);
            }

         })
      } else {
         if (RUDescription !== "" && RUCatalog !== "") {
            console.log('Russian CAT : ' + RUCatalog)
            console.log('Russian : ' + RUDescription)
            con.query(RUQuery, (err, results) => {
               errorString += "Russian";
               console.log(err);
               console.log(results)
            })
         } else {
            console.log('Russian wasnt filled in');
         }
      }

      let finalResult = { ...results, errorString };
      console.log(finalResult)
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
      + ` WHERE SeriesInfo.Language = 'en' AND Series.Publish = '1' ORDER BY SeriesInfo.SeriesId;`;

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

   const relatedQuery = `SELECT SeriesInfo.Title, LinkedSeriesID, LinkedProductID, Type, Code, Description, RelatedProducts.Id FROM RelatedProducts
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



exports.deleteSerieRelatedProductFromDetailsView = async (req, res) => {
   const { Id } = req.body;
   let errorString = '';

   con.query(`DELETE FROM RelatedProducts WHERE Id = ${Id};`, (err, results, fields) => {
      if (err) {
         console.log(err);
         errorString += 'SeriesProductLink, '
      }
      res.send(results)
   })

   
}

exports.searchSerie = async (req, res) => {
   const { searchQuery } = req.body;

   const query = "SELECT SeriesInfo.SeriesId as Sid, Title, Series.Key, Tree"
      + " FROM SeriesInfo"
      + " LEFT JOIN Series ON SeriesInfo.SeriesId = Series.Sid"
      + " LEFT JOIN InfoTree ON InfoTree.LinkId = Series.Sid AND InfoTree.Type = 'S'"
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


   const query = "SELECT Product.Id, Product.CODE, ProductInfo.Catalog, SeriesProductLink.SPLid, SeriesData.Group AS serieDataGroup, SeriesData.Name, SeriesMaster.Group, SeriesMaster.Id AS SerieMasterId, SeriesMaster.SubGroup, SeriesData.Value FROM Product"
      + " LEFT JOIN ProductInfo ON Product.Id = ProductInfo.ProductId"
      + " LEFT JOIN SeriesProductLink ON SeriesProductLink.ProductId = Product.Id"
      + " LEFT JOIN SeriesData ON SeriesProductLink.SPLid = SeriesData.SeriesProductLinkId"
      + " LEFT JOIN SeriesMaster ON SeriesProductLink.SeriesId = SeriesMaster.Sid"
      + ` WHERE SeriesProductLink.SeriesId = "${serieId}" AND ProductInfo.Language = "en" ORDER BY SeriesData.Value ASC;`;

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
         for (const { Id, Key, Value, CODE, Catalog, SPLid, Group, SubGroup, SerieMasterId, serieDataGroup, Name } of results) {
            if (Id === idArray[i]) {
               obj.id = Id;
               obj.Code = CODE;
               obj.Name = Catalog;
               obj.SPLid = SPLid;
               obj.SerieMasterId = SerieMasterId;

               if (SubGroup != null && serieDataGroup == Group && Name == SubGroup) {

                  obj[Group + '-' + SubGroup] = Value;

               } else if (serieDataGroup == Group && Name == SubGroup) {
                  obj[Group] = Value;

               } else if (serieDataGroup == SubGroup && Name == SubGroup) {
                  obj[Group] = Value;

               } else if (SubGroup != null && serieDataGroup == null && Value == null) {

                  obj[Group + '-' + SubGroup] = '';

               } else if (SubGroup == null && serieDataGroup == null) {

                  obj[Group] = '';
               } else if (SubGroup == null && Value == null) {

                  obj[Group] = '';
               }

               //obj[Key] = Value;
            }
         }
         result.push(obj);
      }
      res.send(result)
   })
}

exports.addSeriesRelatedProduct = async (req, res) => {
   const { ProductId, SeriesId } = req.body;
   const querySeriesProductLink = `INSERT INTO SeriesProductLink (ProductId, SeriesId) VALUES ("${ProductId}", "${SeriesId}");`

   con.query(querySeriesProductLink, (err, results, fields) => {
      if (err) {
         console.log(err)
      }

      res.send(results)
   })
}

exports.deleteSerieRelatedProduct = async (req, res) => {
   const { ProductId, SeriesId, SeriesMasterId, SPLid } = req.body;
   let errorString = '';

   con.query(`DELETE FROM SeriesData WHERE SeriesMasterId = '${SeriesMasterId}' AND SeriesProductLinkId = '${SPLid}';`, (err, result, fields) => {
      if (err) {
         errorString += 'Product, '
      }
      console.log(result)
   })
   con.query(`DELETE FROM SeriesProductLink WHERE ProductId = '${ProductId}' AND SeriesId = '${SeriesId}';`, (err, results, fields) => {
      if (err) {
         errorString += 'Product, '
      }
      console.log(results)
      res.send(results)

   })

}

exports.addRelatedProductFromSeriesView = async (req, res) => {
   const { Type, Sequence, serieIDGlobal, LinkedProductID, Catalog, Code } = req.body;
   con.query(`SELECT MAX(Sequence) Sequence FROM RelatedProducts WHERE SeriesId = "${serieIDGlobal}";`, (err, results) => {
      con.query(`INSERT INTO RelatedProducts (Type, Sequence, Code, LinkedProductID, SeriesId, Description) VALUES ("${Type}", ${results[0].Sequence + 1}, "${Code}", "${LinkedProductID}", ${serieIDGlobal}, "${Catalog}");`, (err, results, fields) => {
         if (err) {
            console.log(err)
         }
         res.send(results)
      })
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
   const { SPLid, key, value, SerieMasterId, Group, SubGroup } = req.body;


   const queryCheckExist = `SELECT COUNT(Id) FROM SeriesData WHERE SeriesData.Key = '${key}' AND SeriesProductLinkId = '${SPLid}';`
   const queryUpdate = `UPDATE SeriesData SET Value = '${value}' WHERE SeriesData.Key = '${key}' AND SeriesProductLinkId = '${SPLid}';`
   const queryInsert = `INSERT INTO SeriesData (SerieMasterId, SeriesData.Key, SeriesData.Value, SeriesProductLinkId, SeriesData.Group, SeriesData.Name) VALUES ("${SerieMasterId}", "${key}", '${value}', "${SPLid}", "${Group}", "${SubGroup}" );`

   con.query(queryCheckExist, (err, results) => {
      if (err) throw err;

      if (results[0]['COUNT(Id)'] == 1) {
         con.query(queryUpdate, (err, result) => {
            if (err) throw err;
            res.send(result)
         })
      } else if (results[0]['COUNT(Id)'] == 0) {
         con.query(queryInsert, (err, result) => {
            if (err) throw err;
            res.send(result)
         })
      }

   })
}

exports.updateSequenceSMaster = async (req, res) => {
   const { Id, Sequence } = req.body;

   const query = `UPDATE SeriesMaster SET Sequence = ${Sequence} WHERE Id = ${Id};`

   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
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
   let query = ''
   query = 'SELECT * FROM TranslatedChapters ORDER BY Chapter;'


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


exports.searchAssetsProduct = async (req, res) => {
   const { searchQuery } = req.body;

   const query = 'SELECT Assets.Id, Assets.ProductId, Type, Path, Label, Sequence, Product.CODE, ProductInfo.Catalog FROM Assets'
      + " LEFT JOIN Product ON Product.Id = Assets.ProductId"
      + ` LEFT JOIN ProductInfo ON ProductInfo.ProductId = Product.Id WHERE ProductInfo.Language = 'en' AND Product.CODE LIKE '%${searchQuery}%' ORDER BY Assets.ProductId;`;

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
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

exports.searchAssetsSeries = async (req, res) => {
   const { searchQuery } = req.body;

   const query = 'SELECT Assets.Id, Assets.SerieId, Type, Path, Label, Sequence, Series.Key, SeriesInfo.Title FROM Assets'
      + " LEFT JOIN Series ON Series.Sid = Assets.SerieId"
      + ` LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = Series.Sid WHERE SeriesInfo.Language = 'en' AND Series.Key LIKE '%${searchQuery}%' ORDER BY Assets.SerieId;`

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
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
   const { itemId } = req.body;

   con.query(`DELETE FROM Assets WHERE id = ${itemId};`, (err, results, fields) => {
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

      imagemagickCli
         .exec(`identify assets/${originalname}`)
         .then(({ stdout, stderr }) => {
            let dimensions = stdout.split(' ')[2].split('x');
            const width = dimensions[0];
            const height = dimensions[1];
            landscape = parseInt(width) > parseInt(height) ? true : false;

            // insert other sizes
            imageSizes.forEach(size => {
               let newName = originalname.split('.');
               newName[0] = `${newName[0]}-${size.size}`;
               newName = newName.join('.');

               // set maxWidth or maxHeight depending on image type
               let resizeOption = landscape ? `${size.width}` : `x${size.height}`;
               imagemagickCli
                  .exec(`convert assets/${originalname} -resize "${resizeOption}" assets/${newName}`)
                  .then(({ stdout, stderr }) => {
                     const insertAssets = `INSERT INTO Assets (ProductId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "product-image", "${newName}", "${Label}", "${nextSequence}");`

                     con.query(insertAssets, (err, result) => {
                        if (err) throw err;

                        if (size.size === "large") {
                           res.status(200).send({ ...result, success: true, file: originalname });
                        }
                     })
                  });
            })
         });
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

      imagemagickCli
         .exec(`identify assets/${originalname}`)
         .then(({ stdout, stderr }) => {
            if (stderr) throw stderr;

            let dimensions = stdout.split(' ')[2].split('x');
            const width = dimensions[0];
            const height = dimensions[1];
            landscape = parseInt(width) > parseInt(height) ? true : false;

            // insert other sizes
            imageSizes.forEach(size => {
               let newName = originalname.split('.');

               newName[0] = `${newName[0]}-${size.size}`;
               newName = newName.join('.');

               // set maxWidth or maxHeight depending on image type
               let resizeOption = landscape ? `${size.width}` : `x${size.height}`;
               imagemagickCli
                  .exec(`convert assets/${originalname} -resize "${resizeOption}" assets/${newName}`)
                  .then(({ stdout, stderr }) => {

                     const insertAssets = `INSERT INTO Assets (SerieId, Type, Path, Label, Sequence) VALUES ("${SeriesId}", "serie-image", "${newName}", "${Label}", "${nextSequence}");`

                     con.query(insertAssets, (err, result) => {
                        if (err) throw err;
                        if (size.size === "large") {
                           res.status(200).send({ ...result, success: true, file: originalname });
                        }
                     })
                  })
            })
         })

   })
}


/* ------------------------------ UPDATE ASSETS ----------------------------- */

// upload and save image done by upload middleware, check api-routes.
// after image saved, it will be resized and paths will be saved to Assets database here 
exports.updateuploadProductImage = async (req, res) => {
   let nextSequence, landscape;
   const { originalname } = req.file;
   const { ProductId, Label, oldPath } = req.body;
   const maxSequence = `SELECT MAX(Sequence) AS maxSequence FROM Assets WHERE ProductId = "${ProductId}"`;
   const test = oldPath.split('-')
   test.splice(-1, 1)
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

      const insertAssets = `UPDATE Assets SET ProductId= "${ProductId}" , Type = "product-image", Path = "${originalname}", Label = "${Label}", Sequence = "${nextSequence}" WHERE Assets.Path ="${oldPath}" AND ProductId = ${ProductId};`

      // insert original size
      con.query(insertAssets, (err, result) => {
         if (err) throw err;

      })

      imagemagickCli
         .exec(`identify assets/${originalname}`)
         .then(({ stdout, stderr }) => {
            let dimensions = stdout.split(' ')[2].split('x');
            const width = dimensions[0];
            const height = dimensions[1];
            landscape = parseInt(width) > parseInt(height) ? true : false;

            // insert other sizes
            imageSizes.forEach(size => {
               let newName = originalname.split('.');
               newName[0] = `${newName[0]}-${size.size}`;
               newName = newName.join('.');

               // set maxWidth or maxHeight depending on image type
               let resizeOption = landscape ? `${size.width}` : `x${size.height}`;
               imagemagickCli
                  .exec(`convert assets/${originalname} -resize "${resizeOption}" assets/${newName}`)
                  .then(({ stdout, stderr }) => {
                     const insertAssets = `UPDATE Assets SET ProductId= "${ProductId}" , Type = "product-image", Path = "${newName}", Label = "${Label}", Sequence = "${nextSequence}" WHERE Assets.Path LIKE "${test.join('') + '-' + size.size}%" AND ProductId = ${ProductId};`

                     con.query(insertAssets, (err, result) => {
                        if (err) throw err;

                        if (size.size === "large") {
                           res.status(200).send({ ...result, success: true, file: originalname });
                        }
                     })
                  });
            })
         });
   })
}


// upload and save image done by upload middleware, check api-routes.
// after image saved, it will be resized and paths will be saved to Assets database here 
exports.updateuploadSerieImage = async (req, res) => {

   let nextSequence, landscape;
   const { originalname } = req.file;
   const { SeriesId, Label, oldPath } = req.body;
   const test = oldPath.split('-')
   test.splice(-1, 1)
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


      const insertAssets = `UPDATE Assets SET SerieId = "${SeriesId}", Type = "serie-image", Path = "${originalname}", Label = "${Label}", Sequence = "${nextSequence}" WHERE SerieId = ${SeriesId} AND Assets.Path = "${oldPath}" ;`

      // insert original size
      con.query(insertAssets, (err, result) => {
         if (err) throw err;
      })

      // Check if image is landscape;

      imagemagickCli
         .exec(`identify assets/${originalname}`)
         .then(({ stdout, stderr }) => {
            if (stderr) throw stderr;

            let dimensions = stdout.split(' ')[2].split('x');
            const width = dimensions[0];
            const height = dimensions[1];
            landscape = parseInt(width) > parseInt(height) ? true : false;

            // insert other sizes
            imageSizes.forEach(size => {
               let newName = originalname.split('.');

               newName[0] = `${newName[0]}-${size.size}`;
               newName = newName.join('.');

               // set maxWidth or maxHeight depending on image type
               let resizeOption = landscape ? `${size.width}` : `x${size.height}`;
               imagemagickCli
                  .exec(`convert assets/${originalname} -resize "${resizeOption}" assets/${newName}`)
                  .then(({ stdout, stderr }) => {

                     const insertAssets = `UPDATE Assets SET SerieId = "${SeriesId}", Type = "serie-image", Path = "${newName}", Label = "${Label}", Sequence = "${nextSequence}" WHERE SerieId = ${SeriesId} AND Assets.Path LIKE "${test.join('') + '-' + size.size}%";`

                     con.query(insertAssets, (err, result) => {
                        if (err) throw err;
                        if (size.size === "large") {
                           res.status(200).send({ ...result, success: true, file: originalname });
                        }
                     })
                  })
            })
         })

   })
}

// this route is for testing purposes only
exports.imageMagick = async (req, res) => {
   // imageMagick.identify(appRoot + '/assets/doge.jpg', (err, features) => {
   //    if (err) {
   //       console.log('imageMagick', err);
   //    }
   //    // console.log(features);
   //    console.log(features.width > features.height);

   //    res.send(features);
   // })
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
   // // });
   // imagemagickCli
   //    .exec('convert assets/doge.jpg -resize "100" assets/doge-small.jpg')
   //    .then(({ stdout, stderr }) => {
   //       // console.log(`Output: ${stdout}`);

   //       res.send(stdout)
   //    });
}


/* ------------------------------- LABELS CRUD ------------------------------ */


exports.getLabels = async (req, res) => {
   let query = 'SELECT * FROM Labels order by Labels.Key';


   con.query(query, (err, ungrouped) => {
      if (err) throw err;

      let result = [];
      let lastRecord = null;

      function addResult(record) {
         let idAssigned = false;
         for (let language of LANGUAGES) {
            let translation = record.Translation[language];
            if (translation) {
               if (!record.Translated) {
                  record.Lid = translation.Lid;
                  record.Value = translation.Value;
                  record.Language = language;
                  record.Translated = [translation];
               } else {
                  record.Translated.push(translation);
               }
            } else {
               if (!record.NotTranslated) {
                  record.NotTranslated = [language];
               } else {
                  record.NotTranslated.push(language);
               }

            }
         }
         delete record.Translation;
         result.push(record);
      }

      for (let record of ungrouped) {
         if (lastRecord == null) {
            lastRecord = record;
            lastRecord.Translation = {};
            lastRecord.Translation[record.Language] = { Lid: record.Lid, Language: record.Language, Value: record.Value };
         } else if (lastRecord.Key != record.Key) {
            addResult(lastRecord);
            lastRecord = record;
            lastRecord.Translation = {};
            lastRecord.Translation[record.Language] = { Lid: record.Lid, Language: record.Language, Value: record.Value };
         } else {
            lastRecord.Translation[record.Language] = { Lid: record.Lid, Language: record.Language, Value: record.Value };
         }
      }

      addResult(lastRecord);

      res.send(result);
   })
}

exports.addLabels = async (req, res) => {
   const {
      Key, Language, Value,
      FRLanguage, FRValue,
      SPLanguage, SPValue,
      DELanguage, DEValue,
      RULanguage, RUValue,
   } = req.body;


   if (Value !== "") {
      con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${Language}", "${Value}");`, (err, results, fields) => {
         if (err) throw err;

         res.status(200).send(results);
      });
   } else {
      console.log('english wasnt filled in')
   }

   if (FRValue !== '') {
      con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${FRLanguage}", "${FRValue}");`, (err, results, fields) => {
         if (err) throw err;

      });
   } else {
      console.log('french wasnt filled in')
   }

   if (DEValue !== '') {
      con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${DELanguage}", "${DEValue}");`, (err, results, fields) => {
         if (err) throw err;

      });
   } else {
      console.log('german wasnt filled in')
   }

   if (RUValue !== '') {
      con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${RULanguage}", "${RUValue}");`, (err, results, fields) => {
         if (err) throw err;

      });
   } else {
      console.log('russian wasnt filled in')
   }

   if (SPValue !== '') {
      con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${SPLanguage}", "${SPValue}");`, (err, results, fields) => {
         if (err) throw err;

      });
   } else {
      console.log('spanish wasnt filled in')
   }


}


exports.DeleteLabels = async (req, res) => {
   const { Lid } = req.body;

   con.query(`DELETE FROM Labels WHERE Lid = ${Lid};`, (err, results, fields) => {
      if (err) {
         console.log(err);
      }
      res.send(results)
   })
}

exports.updateLabels = async (req, res) => {
   const {
      oldKey,
      Key, Language, Value,
      FRLanguage, FRValue,
      SPLanguage, SPValue,
      DELanguage, DEValue,
      RULanguage, RUValue
   } = req.body;


   if (Value !== "") {
      con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${Language}", Labels.Value = "${Value}" WHERE Language = 'en' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
         if (err) throw err;

         res.status(200).send(results);
      });
   } else {
      console.log('english wasnt filled in')
   }

   if (FRValue !== '') {
      con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${FRLanguage}", Labels.Value = "${FRValue}" WHERE Language = 'fr' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
         if (err) throw err;

      });
   } else {
      console.log('french wasnt filled in')
   }

   if (DEValue !== '') {
      con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${DELanguage}", Labels.Value = "${DEValue}" WHERE Language = 'de' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
         if (err) throw err;

      });
   } else {
      console.log('german wasnt filled in')
   }

   if (RUValue !== '') {
      con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${RULanguage}", Labels.Value = "${RUValue}" WHERE Language = 'ru' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
         if (err) throw err;

      });
   } else {
      console.log('russian wasnt filled in')
   }

   if (SPValue !== '') {
      con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${SPLanguage}", Labels.Value = "${SPValue}" WHERE Language = 'es' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
         if (err) throw err;

      });
   } else {
      console.log('spanish wasnt filled in')
   }
}


exports.getLabelsDetails = async (req, res) => {
   const { Key, language } = req.body;
   const query = `SELECT Labels.Key, Language, Labels.Value FROM Labels WHERE Language = "${language}" AND Labels.Key = "${Key}";`;

   con.query(query, (err, results, fields) => {
      if (err) throw err;

      res.status(200).send(results);
   })
}


exports.searchLabels = async (req, res) => {
   const { searchQuery, field } = req.body;
   let query = '';

   if (field == 'Key') {
      query = `SELECT * FROM Labels WHERE Labels.Key LIKE '%${searchQuery}%';`;

   } else {
      query = `SELECT * FROM Labels WHERE Labels.Value LIKE '%${searchQuery}%';`;
   }

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

/* ----------------------------- LOCATIONS CRUD ----------------------------- */


exports.getLocations = async (req, res) => {
   let query = ''
   query = 'SELECT * FROM Locations;'


   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}

exports.addLocations = async (req, res) => {
   const { Type, Name, Region, Address, Locality, Country, Tel, Email, OfficeHours, WarehouseHours, GPS, Lat, Lng } = req.body;

   con.query(`INSERT INTO Locations (Type, Name, Region, Address, Locality, Country, Tel, Email, OfficeHours, WarehouseHours, GPS, Lat, Lng) VALUES ("${Type}", "${Name}", "${Region}", "${Address}", "${Locality}", "${Country}", "${Tel}", "${Email}", "${OfficeHours}", "${WarehouseHours}", "${GPS}", "${Lat}", "${Lng}");`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

exports.deleteLocations = async (req, res) => {
   const { LocationsId } = req.body;

   con.query(`DELETE FROM Locations WHERE Id = ${LocationsId};`, (err, results, fields) => {
      if (err) {
         console.log(err);
      }
      res.send(results)
   })
}

exports.updateLocations = async (req, res) => {
   const { LocationsId, Type, Name, Region, Address, Locality, Country, Tel, Email, OfficeHours, WarehouseHours, GPS, Lat, Lng } = req.body;

   const query = `UPDATE Locations SET Locations.Type = '${Type}', Locations.Name = '${Name}', Region = '${Region}', Address = '${Address}', Locality = '${Locality}', Country = '${Country}', Tel = '${Tel}', Email = '${Email}', OfficeHours = '${OfficeHours}', WarehouseHours = '${WarehouseHours}', GPS = '${GPS}', Lat = '${Lat}', Lng = '${Lng}' WHERE Id = ${LocationsId};`

   con.query(query, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}
