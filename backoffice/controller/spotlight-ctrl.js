
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


exports.getSpotlight = async (req, res) => {
    let query = ''
    query = 'SELECT * FROM Spotlight;'
 
 
    con.query(query, (err, result) => {
       if (err) throw err;
 
       res.send(result);
    })
 }
 
 exports.addSpotlight = async (req, res) => {
    const { WorkingTitle, Date, Visual, CreatedOn } = req.body;
 
    con.query(`INSERT INTO Spotlight (WorkingTitle, Date, Visual, CreatedOn) VALUES ("${WorkingTitle}", "${Date}", "${Visual}", "${CreatedOn}");`, (err, results, fields) => {
       if (err) {
          console.log(err)
       }
       res.send(results)
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
 
 