
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


exports.getCategories = async (req, res) => {
   con.query("SELECT C.Id, C.WorkingTitle AS Name, IT.Tree FROM Category C LEFT JOIN InfoTree IT ON C.Id = IT.LinkId and IT.Publish = '1' and IT.Type = 'C' WHERE C.Publish = '1'", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.getOtherLanguageDetail = async (req, res) => {
   const { categoryId, language } = req.body;
   const query = `SELECT Name FROM CategoryInfo WHERE Language = "${language}" AND CategoryId = "${categoryId}";`;

   con.query(query, (err, results, fields) => {
      if (err) throw err;

      res.status(200).send(results);
   })
}

exports.addCategory = async (req, res) => {
   const { ParentId, Title } = req.body;
   const maxSequence = `SELECT MAX(Sequence) as maxSequence, COUNT(*) AS count FROM InfoTree WHERE Parent = "${ParentId}";`;

   con.query(maxSequence, (err, result, fields) => {
      if (err) {
         console.log(err)
      }
      let Sequence = result[0].maxSequence
      console.log(Sequence+1)
         con.query(`INSERT INTO Category (Sequence, WorkingTitle, Publish) VALUES ( "${Sequence+1}", "${Title}", "1");`, (err, results, fields) => {
            if (err) {
               console.log(err)
            }
            let CategoryId = results.insertId;

            con.query(`INSERT INTO InfoTree (Type, Parent, Sequence, Publish, LinkId) VALUES ("C", "${ParentId}", "${Sequence}", "1", "${CategoryId}");`, (err, resultsTree, fields) => {
               if (err) {
                  console.log(err)
               }
            const { Language, Slug, Name,
               FRLanguage, FRName, FRSlug,
               DELanguage, DEName, DESlug,
               SPLanguage, SPName, SPSlug,
               RULanguage, RUName, RUSlug } = req.body;


            if (Name !== "") {
               con.query(`INSERT INTO CategoryInfo (Language, Name, Slug, CategoryId) VALUES ("${Language}", "${Name}", "${Slug}", "${CategoryId}");`, (err, results, fields) => {
                  if (err) throw err;

                  res.status(200).send(results);
               });
            } else {
               console.log('english wasnt filled in')
            }

            if (FRName !== '') {
               con.query(`INSERT INTO CategoryInfo (Language, Name, Slug, CategoryId) VALUES ("${FRLanguage}", "${FRName}", "${FRSlug}", "${CategoryId}");`, (err, results, fields) => {
                  if (err) throw err;

               });
            } else {
               console.log('french wasnt filled in')
            }

            if (DEName !== '') {
               con.query(`INSERT INTO CategoryInfo (Language, Name, Slug, CategoryId) VALUES ("${DELanguage}", "${DEName}", "${DESlug}", "${CategoryId}");`, (err, results, fields) => {
                  if (err) throw err;

               });
            } else {
               console.log('german wasnt filled in')
            }

            if (RUName !== '') {
               con.query(`INSERT INTO CategoryInfo (Language, Name, Slug, CategoryId) VALUES ("${RULanguage}", "${RUName}", "${RUSlug}", "${CategoryId}");`, (err, results, fields) => {
                  if (err) throw err;

               });
            } else {
               console.log('russian wasnt filled in')
            }

            if (SPName !== '') {
               con.query(`INSERT INTO CategoryInfo (Language, Name, Slug, CategoryId) VALUES ("${SPLanguage}", "${SPName}", "${SPSlug}", "${CategoryId}");`, (err, results, fields) => {
                  if (err) throw err;

               });
            } else {
               console.log('spanish wasnt filled in')
            }
         })
      })
   })
}

exports.deleteCategory = async (req, res) => {
   const { id, type } = req.body;
   let errorString = '';
   
   if(type == 'category'){
      con.query(`UPDATE Category SET Publish = 0 WHERE Id = "${id}";`, (err, results, fields) => {
         if (err) {
            errorString += 'Category, '
         }
         res.send(results)
      })
   } else if(type == 'IT'){
      con.query(`UPDATE InfoTree SET Publish = 0 WHERE Id = "${id}";`, (err, result, fields) => {
         if (err) {
            errorString += 'InfoTree, '
         }
         res.send(result)
   })
   }
   
      

}



exports.editCategory = async (req, res) => {
   const { ProductId, Pub, Code, As400, Category, unlinkCategory } = req.body;
   

   con.query(ProductQuery, (err, results) => {
      if (err) throw err;

      const { Language, Slug, Name,
         FRLanguage, FRName, FRSlug, FRDetails,
         DELanguage, DEName, DESlug, DEDetails,
         SPLanguage, SPName, SPSlug, SPDetails,
         RULanguage, RUName, RUSlug, RUDetails } = req.body;

      const ENQuery = `UPDATE CategoryInfo SET Description = '${Description}', Catalog = '${Catalog}', Specification = '${Specification}', FullDescription = '${FullDescription}' WHERE ProductId = "${ProductId}" AND Language = "en"`;
      const FRQuery = `UPDATE CategoryInfo SET Description = '${FRDescription}', Catalog = '${FRCatalog}', Specification = '${FRSpecification}', FullDescription = '${FRFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "fr"`;
      const DEQuery = `UPDATE CategoryInfo SET Description = '${DEDescription}', Catalog = '${DECatalog}', Specification = '${DESpecification}', FullDescription = '${DEFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "de"`;
      const SPQuery = `UPDATE CategoryInfo SET Description = '${SPDescription}', Catalog = '${SPCatalog}', Specification = '${SPSpecification}', FullDescription = '${SPFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "sp" OR Language = "es"`;
      const RUQuery = `UPDATE CategoryInfo SET Description = '${RUDescription}', Catalog = '${RUCatalog}', Specification = '${RUSpecification}', FullDescription = '${RUFullDescription}' WHERE ProductId = "${ProductId}" AND Language = "ru"`;

      const FrQueryInsert = `INSERT INTO CategoryInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${FRLanguage}", "${ModifiedOn}", "${ProductId}", "${FRDescription}", "${FRSpecification}", "${FRCatalog}", "${FRFullDescription}");`
      const DeQueryInsert = `INSERT INTO CategoryInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${DELanguage}", "${ModifiedOn}", "${ProductId}", "${DEDescription}", "${DESpecification}", "${DECatalog}", "${DEFullDescription}");`
      const EsQueryInsert = `INSERT INTO CategoryInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${SPLanguage}", "${ModifiedOn}", "${ProductId}", "${SPDescription}", "${SPSpecification}", "${SPCatalog}", "${SPFullDescription}");`
      const RuQueryInsert = `INSERT INTO CategoryInfo (Language, CreatedOn, ProductId, Description, Specification, Catalog, FullDescription) VALUES ("${RULanguage}", "${ModifiedOn}", "${ProductId}", "${RUDescription}", "${RUSpecification}", "${RUCatalog}", "${RUFullDescription}");`

      if (Name !== "") {
         con.query(ENQuery, (err, results) => {
            if (err) {
               errorString += "English, ";
               console.log(err);
            }

         })
      } else {
         console.log('English wasnt filled in');
      }
      if (FrDetails == 'false' && FRName !== "") {
         console.log('Fr Insert sql')
         con.query(FrQueryInsert, (err, results) => {
            if (err) {
               errorString += "French, ";
               console.log(err);
            }

         })
      } else {

         if (FRName !== "") {
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

      if (DeDetails == 'false' && DEName !== "") {
         con.query(DeQueryInsert, (err, results) => {
            if (err) {
               errorString += "German, ";
               console.log(err);
            }

         })
      } else {

         if (DEName !== "") {
            con.query(DEQuery, (err, results) => {
               errorString += "German, ";
               console.log(err);

            })
         } else {
            console.log('German wasnt filled in');
         }
      }

      if (EsDetails == 'false' && SPName !== "") {
         con.query(EsQueryInsert, (err, results) => {
            if (err) {
               errorString += "Spanish, ";
               console.log(err);
            }

         })
      } else {
         if (SPName !== "") {
            con.query(SPQuery, (err, results) => {
               errorString += "Spanish, ";
               console.log(err);

            })
         } else {
            console.log('Spanish wasnt filled in');
         }
      }

      if (RuDetails == 'false' && RUName !== "") {
         con.query(RuQueryInsert, (err, results) => {
            if (err) {
               errorString += "Russian, ";
               console.log(err);
            }

         })
      } else {
         if (RUName !== "") {
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
      res.send(finalResult);
   })
}
