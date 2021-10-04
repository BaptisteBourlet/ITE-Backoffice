
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
   multipleStatements: true,
   port: '33006'
})


exports.getTransltedChapters = async (req, res) => {
    let query = ''
    query = 'SELECT * FROM TranslatedChapters ORDER BY Chapter;'
 
 
    con.query(query, (err, result) => {
       if (err) throw err;
 
       res.send(result);
    })
 }
 
 exports.addTranslatedChapter = async (req, res) => {
    const { Chapter, Language, Translated } = req.body;
 
    con.query(`INSERT INTO TranslatedChapters (Chapter, Language, Translated) VALUES ("${Chapter}", "${Language}", "${Translated}");`, (err, results, fields) => {
       if (err) {
          console.log(err)
       }
       res.send(results)
    })
 }
 
 
 exports.deleteTranslatedChapter = async (req, res) => {
    const { chapterTransltedId } = req.body;
 
    con.query(`DELETE FROM TranslatedChapters WHERE id = ${chapterTransltedId};`, (err, results, fields) => {
       if (err) {
          console.log(err);
       }
       res.send(results)
    })
 }
 
 exports.updateTranslatedChapters = async (req, res) => {
    const { id, Chapter, Language, Translated } = req.body;
 
    const query = `UPDATE TranslatedChapters SET Chapter = '${Chapter}', Language = '${Language}', Translated = '${Translated}' WHERE id = ${id};`
 
    con.query(query, (err, results) => {
       if (err) throw err;
 
       res.send(results);
    })
 }
 
 