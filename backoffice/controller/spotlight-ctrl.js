
const { DB } = require('../database')
const mysql = require('mysql');
const storage = require('node-sessionstorage');
const multer = require('multer');
const appRoot = require('app-root-path');
const imageMagick = require('imagemagick');
const fs = require('fs');
const imagemagickCli = require('imagemagick-cli');
const { writeFile: writeFileCallback } = require('fs');
const { promisify} = require('util');

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
   
   
   fs.writeFile(appRoot+`/assets/image/spotlight/${VisualName}`, VisualFile, {encoding: 'base64'}, function(err) {
      console.log('File created');
  });
   con.query(`INSERT INTO Spotlight (WorkingTitle, Date, Visual, CreatedOn) VALUES ("${WorkingTitle}", "${Date}", "${VisualName}", "${CreatedOn}");`, (err, results, fields) => {
      if (err) {
         console.log(err)

         // directory to check if exists
         const dir = './assets/image/spotlight';

         // check if directory exists
         // if (fs.existsSync(dir)) {
         //    fs.appendFile(VisualFilename, originalname, function (err) {
         //       if (err) throw err;
         //       console.log('Saved!');
         //    });

         //    console.log('Directory exists!');
         // } else {

         //    fs.mkdir(dir);
         //    fs.appendFile(VisualFilename, originalname, function (err) {
         //       if (err) throw err;
         //       console.log('Saved!');
         //    });
         //    console.log('Directory not found.');
         // }
       }


         let SpotlightID = results.insertId;

         const { Language, Title, CreatedOn, ENPdfFile, PdfName,
            FRLanguage, FRTitle, FRPdf, FRPdfFile, FRPdfName,
            DELanguage, DETitle, DEPdfFile, DEPdfName,
            SPLanguage, SPTitle, SPPdfFile, SPPdfName,
            RULanguage, RUTitle, RUPdfFile, RUPdfName, } = req.body;

         if (Title !== "" && PdfName !== "") {
            fs.writeFile(appRoot+`/assets/image/spotlight/${PdfName}`, ENPdfFile, {encoding: 'base64'}, function(err) {
               console.log('File created');
           });
            con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${Language}", "${Title}", "${PdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
               if (err) throw err;

            });
         } else {
            console.log('english wasnt filled in')
         }

         if (FRTitle !== '' && FRPdf !== '') {
            fs.writeFile(appRoot+`/assets/image/spotlight/${FRPdfName}`, FRPdfFile, {encoding: 'base64'}, function(err) {
               console.log('File created');
           });
            con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${FRLanguage}", "${FRTitle}", "${FRPdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
               if (err) throw err;

            });
         } else {
            console.log('french wasnt filled in')
         }

         if (DETitle !== '' && DEPdfName !== '') {
            fs.writeFile(appRoot+`/assets/image/spotlight/${DEPdfName}`, DEPdfFile, {encoding: 'base64'}, function(err) {
               console.log('File created');
           });
            con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${DELanguage}", "${DETitle}", "${DEPdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
               if (err) throw err;

            });
         } else {
            console.log('german wasnt filled in')
         }

         if (RUTitle !== '' && RUPdfName !== '') {
            fs.writeFile(appRoot+`/assets/image/spotlight/${RUPdfName}`, RUPdfFile, {encoding: 'base64'}, function(err) {
               console.log('File created');
           });
            con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${RULanguage}", "${RUTitle}", "${RUPdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
               if (err) throw err;

            });
         } else {
            console.log('russian wasnt filled in')
         }

         if (SPTitle !== '' && SPPdfName !== '') {
            fs.writeFile(appRoot+`/assets/image/spotlight/${SPPdfName}`, SPPdfFile, {encoding: 'base64'}, function(err) {
               console.log('File created');
           });
            con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${SPLanguage}", "${SPTitle}", "${SPPdfName}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
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
   const { id, WorkingTitle, Date, VisualName, ModifiedOn,VisualFile } = req.body;
   fs.writeFile(appRoot+`/assets/image/spotlight/${VisualName}`, VisualFile, {encoding: 'base64'}, function(err) {
      console.log('File created');
  });
   const query = `UPDATE Spotlight SET WorkingTitle = '${WorkingTitle}', Date = '${Date}', Visual = '${VisualName}', ModifiedOn = '${ModifiedOn}' WHERE id = ${id};`

   con.query(query, (err, results) => {
      if (err) throw err;

      const { Language, Title, ENPdfFile, PdfName,
         FRLanguage, FRTitle, FRPdf, FRPdfFile, FRPdfName,
         DELanguage, DETitle, DEPdfFile, DEPdfName,
         SPLanguage, SPTitle, SPPdfFile, SPPdfName,
         RULanguage, RUTitle, RUPdfFile, RUPdfName, } = req.body;

      if (Title !== "" && PdfName !== "") {
         fs.writeFile(appRoot+`/assets/image/spotlight/${PdfName}`, ENPdfFile, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
         con.query(`UPDATE SpotlightTranslation SET Language = ${Language}, Title = "${Title}", Pdf = "${PdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'en';`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('english wasnt filled in')
      }

      if (FRTitle !== '' && FRPdf !== '') {
         fs.writeFile(appRoot+`/assets/image/spotlight/${FRPdfName}`, FRPdfFile, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
         con.query(`UPDATE SpotlightTranslation SET Language = ${FRLanguage}, Title = "${FRTitle}", Pdf = "${FRPdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'fr';`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('french wasnt filled in')
      }

      if (DETitle !== '' && DEPdfName !== '') {
         fs.writeFile(appRoot+`/assets/image/spotlight/${DEPdfName}`, DEPdfFile, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
         con.query(`UPDATE SpotlightTranslation SET Language = ${DELanguage}, Title = "${DETitle}", Pdf = "${DEPdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'de';`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('german wasnt filled in')
      }

      if (RUTitle !== '' && RUPdfName !== '') {
         fs.writeFile(appRoot+`/assets/image/spotlight/${RUPdfName}`, RUPdfFile, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
         con.query(`UPDATE SpotlightTranslation SET Language = ${RULanguage}, Title = "${RUTitle}", Pdf = "${RUPdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'ru';`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('russian wasnt filled in')
      }

      if (SPTitle !== '' && SPPdfName !== '') {
         fs.writeFile(appRoot+`/assets/image/spotlight/${SPPdfName}`, SPPdfFile, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
         con.query(`UPDATE SpotlightTranslation SET Language = ${SPLanguage}, Title = "${SPTitle}", Pdf = "${SPPdfName}", ModifiedOn = ${ModifiedOn} WHERE SpotlightID = ${id} AND Language = 'SP' OR Language = 'es';`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('spanish wasnt filled in')
      }
   res.send(results);

   })
}

exports.getOtherLanguageDetail = async (req, res) => {
   const { spotlightId, language } = req.body;
   console.log(spotlightId)
   const query = `SELECT Title FROM SpotlightTranslation WHERE Language = "${language}" AND SpotlightID = "${spotlightId}";`;

   con.query(query, (err, results, fields) => {
      if (err) throw err;

      console.log(results)
      res.status(200).send(results);
   })
}
