
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

const LANGUAGES = ['en', 'de', 'es', 'fr', 'ru'];

exports.getLabels = async (req, res) => {
    let query = 'SELECT * FROM Labels order by Labels.Key';
 
 
    con.query(query, (err, ungrouped) => {
       if (err) throw err;
 
       let result = [];
       let lastRecord = null;
 
       function addResult(record) {
          let idAssigned = false;
          for (let language of LANGUAGES) {
             let translation = record.Translation[language];
             if (translation) {
                if (!record.Translated) {
                   record.Lid = translation.Lid;
                   record.Value = translation.Value;
                   record.Language = language;
                   record.Translated = [translation];
                } else {
                   record.Translated.push(translation);
                }
             } else {
                if (!record.NotTranslated) {
                   record.NotTranslated = [language];
                } else {
                   record.NotTranslated.push(language);
                }
 
             }
          }
          delete record.Translation;
          result.push(record);
       }
 
       for (let record of ungrouped) {
          if (lastRecord == null) {
             lastRecord = record;
             lastRecord.Translation = {};
             lastRecord.Translation[record.Language] = { Lid: record.Lid, Language: record.Language, Value: record.Value };
          } else if (lastRecord.Key != record.Key) {
             addResult(lastRecord);
             lastRecord = record;
             lastRecord.Translation = {};
             lastRecord.Translation[record.Language] = { Lid: record.Lid, Language: record.Language, Value: record.Value };
          } else {
             lastRecord.Translation[record.Language] = { Lid: record.Lid, Language: record.Language, Value: record.Value };
          }
       }
 
       addResult(lastRecord);
 
       res.send(result);
    })
 }
 
 exports.addLabels = async (req, res) => {
    const {
       Key, Language, Value,
       FRLanguage, FRValue,
       SPLanguage, SPValue,
       DELanguage, DEValue,
       RULanguage, RUValue,
    } = req.body;
 
 
    if (Value !== "") {
       con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${Language}", "${Value}");`, (err, results, fields) => {
          if (err) throw err;
 
          res.status(200).send(results);
       });
    } else {
       console.log('english wasnt filled in')
    }
 
    if (FRValue !== '') {
       con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${FRLanguage}", "${FRValue}");`, (err, results, fields) => {
          if (err) throw err;
 
       });
    } else {
       console.log('french wasnt filled in')
    }
 
    if (DEValue !== '') {
       con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${DELanguage}", "${DEValue}");`, (err, results, fields) => {
          if (err) throw err;
 
       });
    } else {
       console.log('german wasnt filled in')
    }
 
    if (RUValue !== '') {
       con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${RULanguage}", "${RUValue}");`, (err, results, fields) => {
          if (err) throw err;
 
       });
    } else {
       console.log('russian wasnt filled in')
    }
 
    if (SPValue !== '') {
       con.query(`INSERT INTO Labels (Labels.Key, Language, Labels.Value) VALUES ("${Key}", "${SPLanguage}", "${SPValue}");`, (err, results, fields) => {
          if (err) throw err;
 
       });
    } else {
       console.log('spanish wasnt filled in')
    }
 
 
 }
 
 
 exports.DeleteLabels = async (req, res) => {
    const { Lid } = req.body;
 
    con.query(`DELETE FROM Labels WHERE Lid = ${Lid};`, (err, results, fields) => {
       if (err) {
          console.log(err);
       }
       res.send(results)
    })
 }
 
 exports.updateLabels = async (req, res) => {
    const {
       oldKey,
       Key, Language, Value,
       FRLanguage, FRValue,
       SPLanguage, SPValue,
       DELanguage, DEValue,
       RULanguage, RUValue
    } = req.body;
 
 
    if (Value !== "") {
       con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${Language}", Labels.Value = "${Value}" WHERE Language = 'en' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
          if (err) throw err;
 
          res.status(200).send(results);
       });
    } else {
       console.log('english wasnt filled in')
    }
 
    if (FRValue !== '') {
       con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${FRLanguage}", Labels.Value = "${FRValue}" WHERE Language = 'fr' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
          if (err) throw err;
 
       });
    } else {
       console.log('french wasnt filled in')
    }
 
    if (DEValue !== '') {
       con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${DELanguage}", Labels.Value = "${DEValue}" WHERE Language = 'de' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
          if (err) throw err;
 
       });
    } else {
       console.log('german wasnt filled in')
    }
 
    if (RUValue !== '') {
       con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${RULanguage}", Labels.Value = "${RUValue}" WHERE Language = 'ru' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
          if (err) throw err;
 
       });
    } else {
       console.log('russian wasnt filled in')
    }
 
    if (SPValue !== '') {
       con.query(`UPDATE Labels SET Labels.Key = "${Key}", Language = "${SPLanguage}", Labels.Value = "${SPValue}" WHERE Language = 'es' AND Labels.Key = "${oldKey}";`, (err, results, fields) => {
          if (err) throw err;
 
       });
    } else {
       console.log('spanish wasnt filled in')
    }
 }
 
 
 exports.getLabelsDetails = async (req, res) => {
    const { Key, language } = req.body;
    const query = `SELECT Labels.Key, Language, Labels.Value FROM Labels WHERE Language = "${language}" AND Labels.Key = "${Key}";`;
 
    con.query(query, (err, results, fields) => {
       if (err) throw err;
 
       res.status(200).send(results);
    })
 }
 
 
 exports.searchLabels = async (req, res) => {
    const { searchQuery, field } = req.body;
    let query = '';
 
    if (field == 'Key') {
       query = `SELECT * FROM Labels WHERE Labels.Key LIKE '%${searchQuery}%';`;
 
    } else {
       query = `SELECT * FROM Labels WHERE Labels.Value LIKE '%${searchQuery}%';`;
    }
 
    con.query(query, (err, results, fields) => {
       if (err) {
          console.log(err)
       }
       res.send(results)
    })
 }