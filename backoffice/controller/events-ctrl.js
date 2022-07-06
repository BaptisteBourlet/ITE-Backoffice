
const { DB } = require('../database')
const mysql = require('mysql');
const imagemagickCli = require('imagemagick-cli');

const con = mysql.createConnection({
   ...DB,
   multipleStatements: true,
})


const fs = require('fs');
const appRoot = require('app-root-path');

let queryPromise = (query) => {
   return new Promise((resolve, reject) => {
      con.query(query, (err, result) => {
         if (err) {
            reject(err)
         }

         resolve(result);
      })
   })
};



exports.getAllEvents = async (req, res) => {

   const getAllEvents
      = `SELECT Id, Name, Location, Visual, BannerVisual, Start, End, Url `
      + `FROM Event;`;

   con.query(getAllEvents, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}



exports.addEvent = async (req, res) => {
   const { Name, Location, URL } = req.body;
   const Start = req.body['startDate-inputEl'].split('/').reverse().join('-');
   const End = req.body['endDate-inputEl'].split('/').reverse().join('-');
   const visualPath = '/images/events/';
   const insertInfo
      = `INSERT INTO Event (Name, Location, Online, OnHomePage, Start, End, Url, CreatedOn) `
      + `VALUES ("${Name}", "${Location}", '1', '1', "${Start}", "${End}", "${URL}", CURRENT_TIMESTAMP())`;

   con.query(insertInfo, (err, result) => {
      if (err) throw err;
      if (req.files.length > 0) {
         const insertVisual = `UPDATE Event SET Visual = "${visualPath}${req.files[0].originalname}" WHERE Id = "${result.insertId}"`;
         const insertBannerVisual = `UPDATE Event SET BannerVisual = "${visualPath}${req.files[1].originalname}" WHERE Id = "${result.insertId}"`;

         con.query(insertVisual, (err, result) => {
            if (err) throw err;

            con.query(insertBannerVisual, (err, result) => {
               if (err) throw err;
               res.status(200).send(result);
            })
         })
      } else {
         res.send(result);
      }
   })
}


exports.editEvent = async (req, res) => {
   const { Id, Name, Location, URL, visualCheck, visualBannerCheck, OldVisual, OldBanner } = req.body;
   const Start = req.body['startDate-inputEl'].split('/').reverse().join('-');
   const End = req.body['endDate-inputEl'].split('/').reverse().join('-');
   const visualPath = '/images/events/';

   
   const updateInfo
      = `UPDATE Event SET Name = "${Name}", Location = "${Location}", Url = "${URL}", `
      + `Start = "${Start}", End = "${End}", ModifiedOn = CURRENT_TIMESTAMP() `
      + `WHERE Id = "${Id}";`

   con.query(updateInfo, (err, result) => {
      if (err) throw err;

      if (req.files.length === 2) {

         if (fs.existsSync(appRoot + `/assets${OldVisual}`)) {
            if (fs.existsSync(appRoot + `/assets${OldBanner}`)) {
               fs.unlink(appRoot + `/assets${OldBanner}`, function (err) {
                  if (err) throw err;
      
               });
            }
            fs.unlink(appRoot + `/assets${OldVisual}`, function (err) {
               if (err) throw err;
               // if no error, file has been deleted successfully
               
            });
         }

         const insertVisual = `UPDATE Event SET Visual = "${visualPath}${req.files[0].originalname}" WHERE Id = "${Id}"`;
         const insertBannerVisual = `UPDATE Event SET BannerVisual = "${visualPath}${req.files[1].originalname}" WHERE Id = "${Id}"`;

         con.query(insertVisual, (err, result) => {
            if (err) throw err;

            con.query(insertBannerVisual, (err, result) => {
               if (err) throw err;
               res.status(200).send(result);
            })
         })
      } else if (req.files.length === 1) {

         if (visualCheck === 'true') {

            if (fs.existsSync(appRoot + `/assets${OldVisual}`)) {
               
               fs.unlink(appRoot + `/assets${OldVisual}`, function (err) {
                  if (err) throw err;
                  // if no error, file has been deleted successfully
                  
               });
            }

            const insertVisual = `UPDATE Event SET Visual = "${visualPath}${req.files[0].originalname}" WHERE Id = "${Id}"`;
            con.query(insertVisual, (err, visualResult) => {
               if (err) throw err;

               res.send(visualResult);
            })
         } else {

               if (fs.existsSync(appRoot + `/assets${OldBanner}`)) {
                  fs.unlink(appRoot + `/assets${OldBanner}`, function (err) {
                     if (err) throw err;
         
                  });
               
            }

            const insertBannerVisual = `UPDATE Event SET BannerVisual = "${visualPath}${req.files[0].originalname}" WHERE Id = "${Id}"`;
            con.query(insertBannerVisual, (err, result) => {
               if (err) throw err;
               res.status(200).send(result);
            })
         }
      } else {
         res.send(result);
      }
   })
}


exports.deleteEvent = async (req, res) => {
   const { Id, PathJpg, PathBanner } = req.body;
   const deleteEvent = `DELETE FROM Event WHERE Id = "${Id}"`;
   

   if (fs.existsSync(appRoot + `/assets${PathJpg}`)) {
      if (fs.existsSync(appRoot + `/assets${PathBanner}`)) {
         fs.unlink(appRoot + `/assets${PathBanner}`, function (err) {
            if (err) throw err;

         });
      }
      fs.unlink(appRoot + `/assets${PathJpg}`, function (err) {
         if (err) throw err;
         // if no error, file has been deleted successfully
         con.query(deleteEvent, (err, results, fields) => {
            if (err) {
               console.log(err);
            }

            res.send(results)
         })
      });
   } else {
      con.query(deleteEvent, (err, results, fields) => {
         if (err) {
            console.log(err);
         }

         res.send(results)
      })
      console.log('Sorry, File does not exists!');
   }


}
