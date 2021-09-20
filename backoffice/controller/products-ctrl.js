
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
      con.query(`SELECT RP.Id, RP.LinkedProductID, RP.Type, RP.Code, RP.Description FROM ProductInfo PI LEFT JOIN RelatedProducts RP ON PI.ProductId = RP.ProductId WHERE PI.Language = 'en' AND PI.ProductId = ${productId};`, (error, relatedResults, fields) => {
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


exports.updateSerieSpecs = async (req, res) => {
   const { SPLid, key, value, SerieMasterId, Group, SubGroup, Sid } = req.body;

   const selectSerieMasterId = `SELECT Id FROM SeriesMaster WHERE Sid = '${Sid}' AND SeriesMaster.Group = '${Group}' AND SeriesMaster.SubGroup = '${SubGroup}';`;
   const queryCheckExist = `SELECT COUNT(Id) FROM SeriesData WHERE SeriesData.Key = '${key}' AND SeriesProductLinkId = '${SPLid}';`
   const queryUpdate = `UPDATE SeriesData SET Value = '${value}' WHERE SeriesData.Key = '${key}' AND SeriesProductLinkId = '${SPLid}';`

   con.query(queryCheckExist, (err, results) => {
      if (err) throw err;

      if (results[0]['COUNT(Id)'] == 1) {
         con.query(queryUpdate, (err, result) => {
            if (err) throw err;
            res.send(result)
         })
      } else if (results[0]['COUNT(Id)'] == 0) {

         con.query(selectSerieMasterId, (err, SidResult) => {
            if (err) throw err;
            con.query(`INSERT INTO SeriesData (SerieMasterId, SeriesData.Key, SeriesData.Value, SeriesProductLinkId, SeriesData.Group, SeriesData.Name) VALUES ("${SidResult[0].Id}", "${key}", '${value}', "${SPLid}", "${Group}", "${SubGroup}" );`, (err, result) => {
               if (err) throw err;
               
               res.send(result)
            })
         })
         
      }
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