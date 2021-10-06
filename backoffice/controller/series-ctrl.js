
const { DB } = require('../database')
const mysql = require('mysql');
const storage = require('node-sessionstorage');
const multer = require('multer');
const appRoot = require('app-root-path');
const imageMagick = require('imagemagick');

const imagemagickCli = require('imagemagick-cli');

// imageMagick.convert.path = '/usr/bin/convert';
const con = mysql.createConnection({
   ...DB,
   multipleStatements: true,
})

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
   const serieQuery
      = `SELECT Series.Key, Title, FullDescription, Specification, InfoTree.Parent AS CategoryId `
      + `FROM SeriesInfo `
      + `LEFT JOIN Series ON SeriesInfo.SeriesId = Series.Sid `
      + `LEFT JOIN InfoTree ON InfoTree.Type = 'S' AND InfoTree.LinkId = ${serieId} `
      + `WHERE SeriesInfo.SeriesId = "${serieId}" AND SeriesInfo.Language = "en";`;

   const relatedQuery
      = `SELECT SeriesInfo.Title, LinkedSeriesID, LinkedProductID, Type, Code, Description, RelatedProducts.Id `
      + `FROM RelatedProducts `
      + `LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = RelatedProducts.LinkedSeriesID `
      + `WHERE RelatedProducts.SeriesId = "${serieId}";`

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
   const { Key, CreatedOn, CategoryId } = req.body;
   const seriesInsert = `INSERT INTO Series (Series.Key, CreatedOn, Publish) VALUES ("${Key}", "${CreatedOn}", 1);`

   con.query(seriesInsert, (err, results, fields) => {
      if (err) {
         console.log(err)
      }

      let SeriesId = results.insertId;

      const seriesCategoryLinkInsert = `INSERT INTO InfoTree (Type, Parent, Sequence, Publish, LinkId) VALUES ('S', ${CategoryId}, 0, 1, ${SeriesId})`;
      con.query(seriesCategoryLinkInsert, (err, insertResult) => {
         if (err) throw err;

      })

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
   const { SeriesId, Key, CategoryId, unlinkCategory, ModifiedOn } = req.body;
   let errorString = '';

   const existLink = `SELECT COUNT(*) AS linkCount FROM InfoTree WHERE LinkId = ${SeriesId} AND Type = 'S' and Publish = 1;`;
   const categoryLinkEdit = `Update InfoTree SET Parent = ${CategoryId} WHERE LinkId = ${SeriesId} AND Type = 'S' AND Publish = 1;`;
   const categoryLinkInsert = `INSERT INTO InfoTree (Type, Parent, Sequence, Publish, LinkId) VALUES ('S', ${CategoryId}, 0, 1, ${SeriesId});`;
   const categoryLinkDelete = `DELETE FROM InfoTree WHERE Type = 'S' AND LinkId = ${SeriesId} AND Publish = 1`;

   if (unlinkCategory === '1') {
      con.query(categoryLinkDelete, (err, deleteResult) => {
         if (err) throw err;

         console.log(deleteResult);
      })
   } else {
      con.query(existLink, (err, existResult) => {
         if (err) throw err;

         if (existResult[0].linkCount > 0) {                 // 2 - if TRUE =>  update NEW Category
            con.query(categoryLinkEdit, (err, editResult) => {
               if (err) throw err;

               console.log('edited Serie Category Link')
            })
         }
         else {                                             // 2 - if FALSE => insert NEW record
            con.query(categoryLinkInsert, (err, insertResult) => {
               if (err) {
                  console.log('INSERT ERRRROR', err);
               }

               console.log('insert Serie Category Link')
            })
         }
      })
   }

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

   con.query(`DELETE FROM InfoTree WHERE LinkId = ${SeriesId} AND Type = 'S';`, (err, results, fields) => {
      if (err) {
         console.log(err);
         errorString += 'InfoTree, '
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

   const query = "SELECT Product.Id, Product.CODE, ProductInfo.Catalog, SeriesProductLink.SPLid, SeriesData.Group AS groupSD, SeriesData.Name AS nameSD, SeriesMaster.Group as groupSM, SeriesMaster.Id AS idSM, SeriesMaster.SubGroup AS subGroupSM, SeriesData.Value AS valueSD, SeriesMaster.Sequence AS Sequence FROM Product"
      + " LEFT JOIN ProductInfo ON Product.Id = ProductInfo.ProductId"
      + " LEFT JOIN SeriesProductLink ON SeriesProductLink.ProductId = Product.Id"
      + " LEFT JOIN SeriesMaster ON SeriesProductLink.SeriesId = SeriesMaster.Sid "
      + " LEFT JOIN SeriesData ON SeriesProductLink.SPLid = SeriesData.SeriesProductLinkId AND SeriesMaster.Id = SeriesData.SerieMasterId"
      + ` WHERE SeriesProductLink.SeriesId = "${serieId}" AND ProductInfo.Language = "en" ORDER BY Product.CODE ASC;`;

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
         for (const { Id, valueSD, CODE, Catalog, SPLid, groupSM, subGroupSM, idSM, groupSD, nameSD, Sequence } of results) {
            if (Id === idArray[i]) {
               obj.id = Id;
               obj.Code = CODE;
               obj.Name = Catalog;
               obj.SPLid = SPLid;
               obj.SerieMasterId = idSM;

               // if (subGroupSM != null && groupSD == groupSM && nameSD == subGroupSM) {

               //    obj[groupSM + '-' + subGroupSM] = valueSD;

               // } else if (groupSD == groupSM && nameSD == subGroupSM) {
               //    obj[groupSM] = valueSD;

               // } else if (groupSD == subGroupSM && nameSD == subGroupSM) {
               //    obj[groupSM] = valueSD;

               // } else if (subGroupSM != null && groupSD == null && valueSD == null) {

               //    obj[groupSM + '-' + subGroupSM] = valueSD;

               // } else if (subGroupSM == null && groupSD == null) {

               //    obj[groupSM] = valueSD;
               // } else if (subGroupSM == null && valueSD == null) {

               //    obj[groupSM] = valueSD;
               // }

               if ((subGroupSM === null || subGroupSM === '') && nameSD === '') {
                  obj[groupSM + Sequence] = valueSD;
               } else if ((subGroupSM === null || subGroupSM === '') && nameSD !== groupSM) {
                  obj[groupSM + '--' + nameSD + Sequence] = valueSD;
               } else if ((subGroupSM === null || subGroupSM === '') && nameSD === groupSM) {
                  obj[groupSM + Sequence] = valueSD;
               } else {
                  obj[groupSM + '--' + subGroupSM + Sequence] = valueSD;
               }
            }
         }
         result.push(obj);
      }
      res.send(result)
   })
}




//  exports.getRelatedProductSerie = async (req, res) => {
//    const { serieId } = req.query;

//    const query = "SELECT Product.Id, Product.CODE, ProductInfo.Catalog, SeriesProductLink.SPLid, SeriesData.Key, SeriesData.Value FROM Product"
//       + " LEFT JOIN ProductInfo ON Product.Id = ProductInfo.ProductId"
//       + " LEFT JOIN SeriesProductLink ON SeriesProductLink.ProductId = Product.Id"
//       + " LEFT JOIN SeriesData ON SeriesProductLink.SPLid = SeriesData.SeriesProductLinkId"
//       + ` WHERE SeriesProductLink.SeriesId = "${serieId}" AND ProductInfo.Language = "en" ORDER BY SeriesProductLink.Sequence;`;

//    con.query(query, (err, results, fields) => {
//       if (err) throw err;

//       let idArray = [];
//       let result = [];
//       results.forEach(res => {
//          if (!idArray.includes(res.Id)) {
//             idArray.push(res.Id);
//          }
//       })

//       for (let i = 0; i < idArray.length; i++) {
//          let obj = {};
//          for (const { Id, Key, Value, CODE, Catalog, SPLid } of results) {
//             if (Id === idArray[i]) {
//                obj.id = Id;
//                obj.Code = CODE;
//                obj.Name = Catalog;
//                obj.SPLid = SPLid;
//                obj[Key] = Value;
//             }
//          }
//          result.push(obj);
//       }
//       res.send(result)
//    })
// }

exports.addSeriesRelatedProduct = async (req, res) => {
   const { ProductId, SeriesId } = req.body;

   console.log(req.body);

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

   con.query(`DELETE FROM SeriesData WHERE SerieMasterId = '${SeriesMasterId}' AND SeriesProductLinkId = '${SPLid}';`, (err, result, fields) => {
      if (err) {
         errorString += 'Product, '
      }
      console.log('delete from serie data')
      con.query(`DELETE FROM SeriesProductLink WHERE ProductId = '${ProductId}' AND SeriesId = '${SeriesId}';`, (err, results, fields) => {
         if (err) {
            errorString += 'Product, '
         }
         console.log(results);
         console.log('delete from serie product link')
         res.send(results)
      })
   })
}

exports.addRelatedProductFromSeriesView = async (req, res) => {
   const { Type, serieIDGlobal, LinkedProductID, Catalog, Code } = req.body;
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
   const { SPLid, key, value, SerieMasterId, Group, SubGroup, Sid, masterSequence } = req.body;

   const selectSerieMasterId = `SELECT Id FROM SeriesMaster WHERE Sid = '${Sid}' AND SeriesMaster.Group = '${Group}' AND SeriesMaster.Sequence = '${masterSequence}';`;

   con.query(selectSerieMasterId, (err, SidResult) => {

      const queryCheckExist
         = `SELECT COUNT(Id) FROM SeriesData `
         + `WHERE SerieMasterId = '${SidResult[0].Id}' AND SeriesProductLinkId = '${SPLid}';`

      const updateSeriesData
         = `UPDATE SeriesData SET Value = '${value}' `
         + `WHERE SerieMasterId = '${SidResult[0].Id}' AND SeriesProductLinkId = '${SPLid}';`

      con.query(queryCheckExist, (err, results) => {
         if (err) throw err;

         if (results[0]['COUNT(Id)'] == 1) {
            con.query(updateSeriesData, (err, result) => {
               if (err) throw err;
               res.send(result)

            })
         } else if (results[0]['COUNT(Id)'] == 0) {
            if (err) throw err;

            const insertSeriesData
               = `INSERT INTO SeriesData (SerieMasterId, SeriesData.Value, SeriesProductLinkId, SeriesData.Group, SeriesData.Name) `
               + `VALUES ("${SidResult[0].Id}", '${value}', "${SPLid}", "${Group}", "${SubGroup}");`

            con.query(insertSeriesData, (err, result) => {
               if (err) throw err;

               res.send(result)
            })
         }
      })
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
      con.query(`SELECT RP.Id, RP.LinkedProductID, RP.Type, RP.Code, RP.Description FROM ProductInfo PI LEFT JOIN RelatedProducts RP ON PI.ProductId = RP.ProductId WHERE PI.Language = 'en' AND PI.ProductId = ${productId};`, (error, relatedResults, fields) => {
         if (error) throw error;

         finalResults.push(relatedResults);
         res.send(finalResults);
      })
   });
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
   const maxSequence = `SELECT MAX(Sequence) as maxSequence, COUNT(*) AS count FROM SeriesMaster WHERE Sid = "${serieId}";`;
   const getSPLid = `SELECT SPLid FROM SeriesProductLink WHERE SeriesId = "${serieId}"`;

   con.query(maxSequence, (err, sequenceResult) => { // 1 - get maxSequence from SeriesMaster
      if (err) throw err;

      let nextSequence = sequenceResult[0].maxSequence + 1;
      let nextSerieCount = sequenceResult[0].count + 1;

      const masterInsert
         = `INSERT INTO SeriesMaster (SeriesMaster.Sid, SeriesMaster.Key, SeriesMaster.Group, SubGroup, Sequence) `
         + `VALUES ('${serieId}', '${Key}', '${Group}', '${SubGroup}', '${nextSequence}');`;

      con.query(masterInsert, (err, result) => { // 2 - insert into SeriesMaster
         if (err) throw err;
         let newSerieMasterId = result.insertId;

         con.query(getSPLid, (err, SPLresults) => { // 3 - get all SeriesProductLinkIds
            if (err) throw err;

            SPLresults.forEach((serieProductLink) => { // 4 - insert every SerieProductLink to SeriesData
               const insertToData
                  = `INSERT INTO SeriesData (SerieMasterId, Value, SeriesProductLinkId, SeriesData.Key, SeriesData.Group, Sequence, Name) `
                  + `VALUES ("${newSerieMasterId}", "", "${serieProductLink.SPLid}", "${Key}", "${Group}", "${nextSerieCount}", "${Key}");`

               con.query(insertToData, (err, result) => {
                  if (err) throw err;
               })
            }) // - 4

            res.send(SPLresults);
         }) // - 3
      }) // - 2
   }) // 1
}


exports.deleteSeriesMasterSpecs = async (req, res) => {
   const { Id } = req.body;

   console.log(req.body);


   const deleteSeriesDataQuery
            = ``;


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


exports.getProductDet = async (req, res) => {
   con.query("SELECT CODE, Id FROM Product;", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

exports.getRelatedCatalog = async (req, res) => {
   const { ProductId } = req.body;

   con.query(`SELECT Catalog FROM ProductInfo WHERE ProductId = "${ProductId}" AND Language = 'en';`, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
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



exports.getLinkedImage = async (req, res) => {
   const { Id } = req.query;

   if (Id) {
      const query = `SELECT * FROM Assets WHERE SerieId = ${Id} ORDER BY Sequence`;
      con.query(query, (err, results) => {
         if (err) throw err;

         res.send(results);
      })
   } else {
      res.send({ a: 'a' });
   }
}

exports.updateImageSequence = async (req, res) => {
   const { Id, Sequence } = req.body;

   const query = `UPDATE Assets SET Sequence = ${Sequence} WHERE Id = ${Id};`

   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}
