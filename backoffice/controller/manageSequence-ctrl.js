
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