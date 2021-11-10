
const { DB } = require('../database')
const mysql = require('mysql');
const storage = require('node-sessionstorage');
const multer = require('multer');
const appRoot = require('app-root-path');
const imageMagick = require('imagemagick');
const fs = require('fs');
const imagemagickCli = require('imagemagick-cli');

// imageMagick.convert.path = '/usr/bin/convert';
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
   const { WorkingTitle, Date, Visual, CreatedOn } = req.body;
   console.log(req)
   const { originalname } = req.file;

   const VisualFilename = Visual

   
   con.query(`INSERT INTO Spotlight (WorkingTitle, Date, Visual, CreatedOn) VALUES ("${WorkingTitle}", "${Date}", "${Visual}", "${CreatedOn}");`, (err, results, fields) => {
      if (err) {
         console.log(err)

         // directory to check if exists
         const dir = './assets/image/spotlight';

         // check if directory exists
         if (fs.existsSync(dir)) {
            fs.appendFile(VisualFilename, originalname, function (err) {
               if (err) throw err;
               console.log('Saved!');
            });

            console.log('Directory exists!');
         } else {

            fs.mkdir(dir);
            fs.appendFile(VisualFilename, originalname, function (err) {
               if (err) throw err;
               console.log('Saved!');
            });
            console.log('Directory not found.');
         }
      }


      let SpotlightID = results.insertId;

      const { Language, Title, CreatedOn, Pdf,
         FRLanguage, FRTitle, FRPdf,
         DELanguage, DETitle, DEPdf,
         SPLanguage, SPTitle, SPPdf,
         RULanguage, RUTitle, RUPdf } = req.body;

      if (Title !== "" && Pdf !== "") {
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${Language}", "${Title}", "${Pdf}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;


            res.status(200).send(results);
         });
      } else {
         console.log('english wasnt filled in')
      }

      if (FRTitle !== '' && FRPdf !== '') {
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${FRLanguage}", "${FRTitle}", "${FRPdf}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('french wasnt filled in')
      }

      if (DETitle !== '' && DEPdf !== '') {
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${DELanguage}", "${DETitle}", "${DEPdf}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('german wasnt filled in')
      }

      if (RUTitle !== '' && RUPdf !== '') {
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${RULanguage}", "${RUTitle}", "${RUPdf}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('russian wasnt filled in')
      }

      if (SPTitle !== '' && SPPdf !== '') {
         con.query(`INSERT INTO SpotlightTranslation (Language, Title, Pdf, CreatedOn, SpotlightID) VALUES ("${SPLanguage}", "${SPTitle}", "${SPPdf}", "${CreatedOn}", "${SpotlightID}");`, (err, results, fields) => {
            if (err) throw err;

         });
      } else {
         console.log('spanish wasnt filled in')
      }
   })

}


exports.deleteSpotlight = async (req, res) => {
   const { Id } = req.body;

   con.query(`DELETE FROM Spotlight WHERE id = ${Id};`, (err, results, fields) => {
      if (err) {
         console.log(err);
      }
      res.send(results)
   })
}

exports.updateSpotlight = async (req, res) => {
   const { id, WorkingTitle, Date, Visual, ModifiedOn } = req.body;

   const query = `UPDATE Spotlight SET WorkingTitle = '${WorkingTitle}', Date = '${Date}', Visual = '${Visual}', ModifiedOn = '${ModifiedOn}' WHERE id = ${id};`

   con.query(query, (err, results) => {
      if (err) throw err;

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

      const insertSpotlight = `INSERT INTO Spotlight (Visual_id, Type, Path, Label, Sequence) VALUES ("${ProductId}", "product-image", "${originalname}", "${Label}", "${nextSequence}");`

      // insert original size
      con.query(insertSpotlight, (err, result) => {
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
                     const insertSpotlight = `INSERT INTO Assets (ProductId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "product-image", "${newName}", "${Label}", "${nextSequence}");`

                     con.query(insertSpotlight, (err, result) => {
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