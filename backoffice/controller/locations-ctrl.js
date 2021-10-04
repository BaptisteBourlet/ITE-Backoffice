
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



exports.getLocations = async (req, res) => {
    let query = ''
    query = 'SELECT * FROM Locations;'
 
 
    con.query(query, (err, result) => {
       if (err) throw err;
 
       res.send(result);
    })
 }
 
 exports.addLocations = async (req, res) => {
    const { Type, Name, Region, Address, Locality, Country, Tel, Email, OfficeHours, WarehouseHours, GPS, Lat, Lng } = req.body;
 
    con.query(`INSERT INTO Locations (Type, Name, Region, Address, Locality, Country, Tel, Email, OfficeHours, WarehouseHours, GPS, Lat, Lng) VALUES ("${Type}", "${Name}", "${Region}", "${Address}", "${Locality}", "${Country}", "${Tel}", "${Email}", "${OfficeHours}", "${WarehouseHours}", "${GPS}", "${Lat}", "${Lng}");`, (err, results, fields) => {
       if (err) {
          console.log(err)
       }
       res.send(results)
    })
 }
 
 exports.deleteLocations = async (req, res) => {
    const { LocationsId } = req.body;
 
    con.query(`DELETE FROM Locations WHERE Id = ${LocationsId};`, (err, results, fields) => {
       if (err) {
          console.log(err);
       }
       res.send(results)
    })
 }
 
 exports.updateLocations = async (req, res) => {
    const { LocationsId, Type, Name, Region, Address, Locality, Country, Tel, Email, OfficeHours, WarehouseHours, GPS, Lat, Lng } = req.body;
 
    const query = `UPDATE Locations SET Locations.Type = '${Type}', Locations.Name = '${Name}', Region = '${Region}', Address = '${Address}', Locality = '${Locality}', Country = '${Country}', Tel = '${Tel}', Email = '${Email}', OfficeHours = '${OfficeHours}', WarehouseHours = '${WarehouseHours}', GPS = '${GPS}', Lat = '${Lat}', Lng = '${Lng}' WHERE Id = ${LocationsId};`
 
    con.query(query, (err, results) => {
       if (err) throw err;
 
       res.send(results);
    })
 }