
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