
const { DB } = require('../database')
const mysql = require('mysql');

const imagemagickCli = require('imagemagick-cli');
const e = require('express');

const con = mysql.createConnection({
   ...DB,
   multipleStatements: true,
})


exports.getAllEvents = async (req, res) => {

   const getAllEvents
      = `SELECT Id, Name, Location, Visual, BannerVisual, Start, End, Url `
      + `FROM Event`;

   con.query(getAllEvents, (err, results) => {
      if (err) throw err;

      res.send(results);
   })
}


exports.getEventDetail = async (req, res) => {
   const { eventID } = req.body;

   const eventDetail
      = `SELECT Id, Name, Location, `
}


exports.addEvent = async (req, res) => {
   const { Name, Location, URL } = req.body;
   const Start = req.body['startDate-inputEl'].split('/').reverse().join('-');
   const End = req.body['endDate-inputEl'].split('/').reverse().join('-');
   const visualPath = '/images/events/';
   const insertInfo
      = `INSERT INTO Event (Name, Location, Online, OnHomePage, Start, End, Url, CreatedOn) `
      + `VALUES ("${Name}", "${Location}", '1', '1', "${Start}", "${End}", "${URL}", CURRENT_TIMESTAMP())`;
   console.log(req.body);
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
   const { Id, Name, Location, URL } = req.body;
   const Start = req.body['startDate-inputEl'].split('/').reverse().join('-');
   const End = req.body['endDate-inputEl'].split('/').reverse().join('-');
   const visualPath = '/images/events/';

   const updateInfo
      = `UPDATE Event SET Name = "${Name}", Location = "${Location}", Url = "${URL}", `
      + `Start = "${Start}", End = "${End}", ModifiedOn = CURRENT_TIMESTAMP() `
      + `WHERE Id = "${Id}"`

   con.query(updateInfo, (err, result) => {
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


exports.deleteEvent = async (req, res) => {
   const { Id } = req.body;
   const deleteEvent = `DELETE FROM Event WHERE Id = "${Id}"`;

   con.query(deleteEvent, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}
