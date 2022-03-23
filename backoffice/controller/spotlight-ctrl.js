
const { DB } = require('../database')
const mysql = require('mysql');
const storage = require('node-sessionstorage');
const multer = require('multer');
const appRoot = require('app-root-path');
const imageMagick = require('imagemagick');
const fs = require('fs');
const imagemagickCli = require('imagemagick-cli');
const { writeFile: writeFileCallback } = require('fs');
const { promisify } = require('util');

const writeFileP = promisify(writeFileCallback);

const con = mysql.createConnection({
   ...DB,
   multipleStatements: true,
})




exports.getSpotlight = async (req, res) => {

   const query = 'SELECT Spotlight.Id, WorkingTitle, Date, Visual, Pdf, Title FROM Spotlight LEFT JOIN SpotlightTranslation ON Spotlight.Id = SpotlightTranslation.SpotlightID WHERE Language = "en";'


   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}



exports.addSpotlight = async (req, res) => {
   const { WorkingTitle, Date, VisualName, CreatedOn, VisualFile } = req.body;

   fs.writeFile(appRoot + `/assets/images/spotlight/${VisualName}`, VisualFile, { encoding: 'base64' }, function (err) {
      console.log('File created');
   });
   con.query(`INSERT INTO Spotlight (WorkingTitle, Date, Visual, CreatedOn) VALUES ("${WorkingTitle}", "${Date}", "${VisualName}", "${CreatedOn}");`, (err, results, fields) => {
      if (err) {
         console.log(err)

         // directory to check if exists
         const dir = './assets/images/spotlight';

      }

      let SpotlightID = results.insertId;

      const { Language, Title, CreatedOn, ENPdfFile, PdfName,
         FRLanguage, FRTitle, FRPdf, FRPdfFile, FRPdfName,
         DELanguage, DETitle, DEPdfFile, DEPdfName,
         ESLanguage, ESTitle, ESPdfFile, ESPdfName,
         RULanguage, RUTitle, RUPdfFile, RUPdfName, } = req.body;

      if (Title !== "" && PdfName !== "") {
         fs.writeFile(appRoot + `/assets/images/spotlight/${PdfName}`, ENPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${Language}", "${Title}", "${PdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('english wasnt filled in')
      }

      if (FRTitle !== '' && FRPdf !== '') {
         fs.writeFile(appRoot + `/assets/images/spotlight/${FRPdfName}`, FRPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${FRLanguage}", "${FRTitle}", "${FRPdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('french wasnt filled in')
      }

      if (DETitle !== '' && DEPdfName !== '') {
         fs.writeFile(appRoot + `/assets/images/spotlight/${DEPdfName}`, DEPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${DELanguage}", "${DETitle}", "${DEPdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('german wasnt filled in')
      }

      if (RUTitle !== '' && RUPdfName !== '') {
         fs.writeFile(appRoot + `/assets/images/spotlight/${RUPdfName}`, RUPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${RULanguage}", "${RUTitle}", "${RUPdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('russian wasnt filled in')
      }

      if (ESTitle !== '' && ESPdfName !== '') {
         fs.writeFile(appRoot + `/assets/images/spotlight/${ESPdfName}`, ESPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${ESLanguage}", "${ESTitle}", "${ESPdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {

         console.log('spanish wasnt filled in')
      }
      res.send(results);

   })

}


exports.deleteSpotlight = async (req, res) => {
   const { Id } = req.body;

   con.query(`DELETE FROM Spotlight WHERE id = ${Id};`, (err, results, fields) => {

      if (err) {
         console.log(err);
      }
      con.query(`DELETE FROM SpotlightTranslation WHERE SpotlightID = ${Id};`, (err, results, fields) => {
         if (err) {
            console.log(err);
         }
      })
      res.send(results)
   })
}

exports.updateSpotlight = async (req, res) => {
   const { id, WorkingTitle, Date, VisualName, ModifiedOn, VisualFile, VisualChanges } = req.body;
   
   var query
   if (VisualChanges == 'Yes') {
      fs.writeFile(appRoot + `/assets/images/spotlight/${VisualName}`, VisualFile, { encoding: 'base64' }, function (err) {
         console.log('File created');
      });
      query = `UPDATE Spotlight SET WorkingTitle = '${WorkingTitle}', Date = '${Date}', Visual = '${VisualName}', ModifiedOn = '${ModifiedOn}' WHERE id = ${id};`

   } else {
      query = `UPDATE Spotlight SET WorkingTitle = '${WorkingTitle}', Date = '${Date}', ModifiedOn = '${ModifiedOn}' WHERE id = ${id};`

   }

   con.query(query, (err, results) => {
      if (err) throw err;

      const { Language, Title, ENPdfFile, PdfName, ENPdfChange,
         FRLanguage, FRTitle, FRPdf, FRPdfFile, FRPdfName, FRPdfChange,
         DELanguage, DETitle, DEPdfFile, DEPdfName, DEPdfChange,
         ESLanguage, ESTitle, ESPdfFile, ESPdfName, ESPdfChange,
         RULanguage, RUTitle, RUPdfFile, RUPdfName, RUPdfChange } = req.body;


         //check if datas for translations exists
      const existTransEN = `SELECT COUNT(*) AS transCount FROM SpotlightTranslation WHERE SpotlightID = ${id} AND Language = 'en';`;
      const existTransFR = `SELECT COUNT(*) AS transCountFR FROM SpotlightTranslation WHERE SpotlightID = ${id} AND Language = 'fr';`;
      const existTransDE = `SELECT COUNT(*) AS transCountDE FROM SpotlightTranslation WHERE SpotlightID = ${id} AND Language = 'de';`;
      const existTransES = `SELECT COUNT(*) AS transCountES FROM SpotlightTranslation WHERE SpotlightID = ${id} AND Language = 'es';`;
      const existTransRU = `SELECT COUNT(*) AS transCountRU FROM SpotlightTranslation WHERE SpotlightID = ${id} AND Language = 'ru';`;
         

      if (Title !== "" && PdfName !== "") {
         fs.writeFile(appRoot + `/assets/images/spotlight/${PdfName}`, ENPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });

         con.query(existTransEN, (err, transResult) => {
            if (err) throw err;

            if (transResult[0].transCount > 0) {                 // 2 - if TRUE =>  update Translations
               con.query(`UPDATE SpotlightTranslation SET Title = "${Title}", Pdf = "${PdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'en';`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
            else {                                             // 2 - if FALSE => insert NEW record
               con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${Language}", "${Title}", "${PdfName}", "${ModifiedOn}", "${id}");`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
         })


         
      } else {
         console.log('english wasnt filled in')
      }

      if (FRTitle !== '' && FRPdf !== '') {
         fs.writeFile(appRoot + `/assets/images/spotlight/${FRPdfName}`, FRPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });


         con.query(existTransFR, (err, transResult) => {
            if (err) throw err;

            if (transResult[0].transCountFR > 0) {                 // 2 - if TRUE =>  update Translations
               con.query(`UPDATE SpotlightTranslation SET Title = "${FRTitle}", Pdf = "${FRPdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'fr';`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
            else {                                             // 2 - if FALSE => insert NEW record
               con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${FRLanguage}", "${FRTitle}", "${FRPdfName}", "${ModifiedOn}", "${id}");`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
         })
         
      } else {
         console.log('french wasnt filled in')
      }

      if (DETitle !== '' && DEPdfName !== '') {
         fs.writeFile(appRoot + `/assets/images/spotlight/${DEPdfName}`, DEPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });

         con.query(existTransDE, (err, transResult) => {
            if (err) throw err;

            if (transResult[0].transCountDE > 0) {                 // 2 - if TRUE =>  update Translations
               con.query(`UPDATE SpotlightTranslation SET Title = "${DETitle}", Pdf = "${DEPdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'de';`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
            else {                                             // 2 - if FALSE => insert NEW record
               con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("de", "${DETitle}", "${DEPdfName}", "${ModifiedOn}", "${id}");`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
         })
         
      } else {
         console.log('german wasnt filled in')
      }

      if (RUTitle !== '' && RUPdfName !== '') {
         fs.writeFile(appRoot + `/assets/images/spotlight/${RUPdfName}`, RUPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });
         con.query(existTransRU, (err, transResult) => {
            if (err) throw err;

            if (transResult[0].transCountRU > 0) {                 // 2 - if TRUE =>  update Translations
               con.query(`UPDATE SpotlightTranslation SET Title = "${RUTitle}", Pdf = "${RUPdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'ru';`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
            else {                                             // 2 - if FALSE => insert NEW record
               con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${RULanguage}", "${RUTitle}", "${RUPdfName}", "${ModifiedOn}", "${id}");`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
         })
         
      } else {
         console.log('russian wasnt filled in')
      }

      if (ESTitle !== '' && ESPdfName !== '') {
         fs.writeFile(appRoot + `/assets/images/spotlight/${ESPdfName}`, ESPdfFile, { encoding: 'base64' }, function (err) {
            console.log('File created');
         });

         con.query(existTransES, (err, transResult) => {
            if (err) throw err;

            if (transResult[0].transCountES > 0) {  
               con.query(`UPDATE SpotlightTranslation SET Title = "${ESTitle}", Pdf = "${ESPdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'es';`, (err, results, fields) => {
                  if (err) throw err;
      
               });               // 2 - if TRUE =>  update Translations
               
            }
            else {                                             // 2 - if FALSE => insert NEW record
               con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${ESLanguage}", "${ESTitle}", "${ESPdfName}", "${ModifiedOn}", "${id}");`, (err, results, fields) => {
                  if (err) throw err;
      
               });
            }
         })
         
      } else {
         console.log('spanish wasnt filled in')
      }
      res.send(results);

   })
}

exports.getOtherLanguageDetail = async (req, res) => {
   const { spotlightId, language } = req.body;

   const query = `SELECT Title, Pdf FROM SpotlightTranslation WHERE Language = "${language}" AND SpotlightID = "${spotlightId}";`;

   con.query(query, (err, results, fields) => {
      if (err) throw err;

      res.status(200).send(results);
   })
}
