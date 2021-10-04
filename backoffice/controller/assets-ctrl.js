
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


exports.getAssets = async (req, res) => {
    const query = 'SELECT Assets.Id, Assets.ProductId, Type, Path, Label, Sequence, Product.CODE, ProductInfo.Catalog FROM Assets'
       + " LEFT JOIN Product ON Product.Id = Assets.ProductId"
       + " LEFT JOIN ProductInfo ON ProductInfo.ProductId = Product.Id WHERE ProductInfo.Language = 'en' ORDER BY Assets.ProductId;"
 
    con.query(query, (err, result) => {
       if (err) throw err;
 
       res.send(result);
    })
 }
 
 
 exports.searchAssetsProduct = async (req, res) => {
    const { searchQuery } = req.body;
 
    const query = 'SELECT Assets.Id, Assets.ProductId, Type, Path, Label, Sequence, Product.CODE, ProductInfo.Catalog FROM Assets'
       + " LEFT JOIN Product ON Product.Id = Assets.ProductId"
       + ` LEFT JOIN ProductInfo ON ProductInfo.ProductId = Product.Id WHERE ProductInfo.Language = 'en' AND Product.CODE LIKE '%${searchQuery}%' ORDER BY Assets.ProductId;`;
 
    con.query(query, (err, results, fields) => {
       if (err) {
          console.log(err)
       }
       res.send(results)
    })
 }
 
 
 exports.getSeriesAssets = async (req, res) => {
    const query = 'SELECT Assets.Id, Assets.SerieId, Type, Path, Label, Sequence, Series.Key, SeriesInfo.Title FROM Assets'
       + " LEFT JOIN Series ON Series.Sid = Assets.SerieId"
       + " LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = Series.Sid WHERE SeriesInfo.Language = 'en' ORDER BY Assets.SerieId;"
 
    con.query(query, (err, result) => {
       if (err) throw err;
 
       res.send(result);
    })
 }
 
 exports.searchAssetsSeries = async (req, res) => {
    const { searchQuery } = req.body;
 
    const query = 'SELECT Assets.Id, Assets.SerieId, Type, Path, Label, Sequence, Series.Key, SeriesInfo.Title FROM Assets'
       + " LEFT JOIN Series ON Series.Sid = Assets.SerieId"
       + ` LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = Series.Sid WHERE SeriesInfo.Language = 'en' AND Series.Key LIKE '%${searchQuery}%' ORDER BY Assets.SerieId;`
 
    con.query(query, (err, results, fields) => {
       if (err) {
          console.log(err)
       }
       res.send(results)
    })
 }
 
 exports.addAssets = async (req, res) => {
    const { ProductId, SerieId, Type, Path, Label, Sequence } = req.body;
 
 
    con.query(`INSERT INTO Assets (ProductId, SerieId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "${SerieId}", "${Type}", "${Path}", "${Label}", "${Sequence}");`, (err, results, fields) => {
       if (err) {
          console.log(err)
       }
       res.send(results)
    })
 }
 
 exports.getSeriesDet = async (req, res) => {
    const query = 'SELECT Sid AS Id, Series.Key AS CODE FROM Series;'
 
    con.query(query, (err, result) => {
       if (err) throw err;
 
       res.send(result);
    })
 }
 
 exports.updateSequence = async (req, res) => {
    const { Id, Sequence } = req.body;
 
    const query = `UPDATE Assets SET Sequence = ${Sequence} WHERE Id = ${Id};`
 
    con.query(query, (err, result) => {
       if (err) throw err;
 
       res.send(result);
    })
 }
 
 exports.deleteAssets = async (req, res) => {
    const { itemId } = req.body;
 
    con.query(`DELETE FROM Assets WHERE id = ${itemId};`, (err, results, fields) => {
       if (err) {
          console.log(err);
       }
       res.send(results)
    })
 }
 
 
 
 // upload and save image done by upload middleware, check api-routes.
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
 
       const insertAssets = `INSERT INTO Assets (ProductId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "product-image", "${originalname}", "${Label}", "${nextSequence}");`
 
       // insert original size
       con.query(insertAssets, (err, result) => {
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
                      const insertAssets = `INSERT INTO Assets (ProductId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "product-image", "${newName}", "${Label}", "${nextSequence}");`
 
                      con.query(insertAssets, (err, result) => {
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
 
 
 // upload and save image done by upload middleware, check api-routes.
 // after image saved, it will be resized and paths will be saved to Assets database here 
 exports.uploadSerieImage = async (req, res) => {
 
    let nextSequence, landscape;
    const { originalname } = req.file;
    const { SeriesId, Label } = req.body;
    const maxSequence = `SELECT MAX(Sequence) AS maxSequence FROM Assets WHERE SerieId = "${SeriesId}"`;
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
 
 
       const insertAssets = `INSERT INTO Assets (SerieId, Type, Path, Label, Sequence) VALUES ("${SeriesId}", "serie-image", "${originalname}", "${Label}", "${nextSequence}");`
 
       // insert original size
       con.query(insertAssets, (err, result) => {
          if (err) throw err;
       })
 
 
 
       // Check if image is landscape;
 
       imagemagickCli
          .exec(`identify assets/${originalname}`)
          .then(({ stdout, stderr }) => {
             if (stderr) throw stderr;
 
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
 
                      const insertAssets = `INSERT INTO Assets (SerieId, Type, Path, Label, Sequence) VALUES ("${SeriesId}", "serie-image", "${newName}", "${Label}", "${nextSequence}");`
 
                      con.query(insertAssets, (err, result) => {
                         if (err) throw err;
                         if (size.size === "large") {
                            res.status(200).send({ ...result, success: true, file: originalname });
                         }
                      })
                   })
             })
          })
 
    })
 }
 
 
 /* ------------------------------ UPDATE ASSETS ----------------------------- */
 
 // upload and save image done by upload middleware, check api-routes.
 // after image saved, it will be resized and paths will be saved to Assets database here 
 exports.updateuploadProductImage = async (req, res) => {
    let nextSequence, landscape;
    const { originalname } = req.file;
    const { ProductId, Label, oldPath } = req.body;
    const maxSequence = `SELECT MAX(Sequence) AS maxSequence FROM Assets WHERE ProductId = "${ProductId}"`;
    const test = oldPath.split('-')
    test.splice(-1, 1)
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
 
       const insertAssets = `UPDATE Assets SET ProductId= "${ProductId}" , Type = "product-image", Path = "${originalname}", Label = "${Label}", Sequence = "${nextSequence}" WHERE Assets.Path ="${oldPath}" AND ProductId = ${ProductId};`
 
       // insert original size
       con.query(insertAssets, (err, result) => {
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
                      const insertAssets = `UPDATE Assets SET ProductId= "${ProductId}" , Type = "product-image", Path = "${newName}", Label = "${Label}", Sequence = "${nextSequence}" WHERE Assets.Path LIKE "${test.join('') + '-' + size.size}%" AND ProductId = ${ProductId};`
 
                      con.query(insertAssets, (err, result) => {
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
 
 
 // upload and save image done by upload middleware, check api-routes.
 // after image saved, it will be resized and paths will be saved to Assets database here 
 exports.updateuploadSerieImage = async (req, res) => {
 
    let nextSequence, landscape;
    const { originalname } = req.file;
    const { SeriesId, Label, oldPath } = req.body;
    const test = oldPath.split('-')
    test.splice(-1, 1)
    const maxSequence = `SELECT MAX(Sequence) AS maxSequence FROM Assets WHERE SerieId = "${SeriesId}"`;
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
 
 
       const insertAssets = `UPDATE Assets SET SerieId = "${SeriesId}", Type = "serie-image", Path = "${originalname}", Label = "${Label}", Sequence = "${nextSequence}" WHERE SerieId = ${SeriesId} AND Assets.Path = "${oldPath}" ;`
 
       // insert original size
       con.query(insertAssets, (err, result) => {
          if (err) throw err;
       })
 
       // Check if image is landscape;
 
       imagemagickCli
          .exec(`identify assets/${originalname}`)
          .then(({ stdout, stderr }) => {
             if (stderr) throw stderr;
 
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
 
                      const insertAssets = `UPDATE Assets SET SerieId = "${SeriesId}", Type = "serie-image", Path = "${newName}", Label = "${Label}", Sequence = "${nextSequence}" WHERE SerieId = ${SeriesId} AND Assets.Path LIKE "${test.join('') + '-' + size.size}%";`
 
                      con.query(insertAssets, (err, result) => {
                         if (err) throw err;
                         if (size.size === "large") {
                            res.status(200).send({ ...result, success: true, file: originalname });
                         }
                      })
                   })
             })
          })
 
    })
 }
 
 // this route is for testing purposes only
 exports.imageMagick = async (req, res) => {
    // imageMagick.identify(appRoot + '/assets/doge.jpg', (err, features) => {
    //    if (err) {
    //       console.log('imageMagick', err);
    //    }
    //    // console.log(features);
    //    console.log(features.width > features.height);
 
    //    res.send(features);
    // })
    // imageMagick.convert([appRoot + '/assets/doge.jpg', '-resize', '25x120', 'doge-small.jpg'],
    //    function (err, stdout) {
    //       if (err) throw err;
    //       console.log('stdout:', stdout);
    //    });
 
    // const options = {
    //    srcPath: appRoot + '/assets/doge.jpg',
    //    dstPath: appRoot + '/assets/doge-large.jpg',
    //    width: 200,
    //    // quality: 0.8,
    //    // format: 'jpg',
    //    // progressive: false,
    //    // srcData: appRoot + '/assets/doge-small.jpg',
    //    // srcFormat: null,
    //    // height: 0,
    //    // strip: true,
    //    // filter: 'Lagrange',
    //    // sharpening: 0.2,
    //    // customArgs: []
    // }
    // imageMagick.resize(options, function (err, stdout, sdterr) {
    //    if (err) throw err;
    //    console.log('stdout:', stdout);
    //    console.log('sdterr:', sdterr);
    // // });
    // imagemagickCli
    //    .exec('convert assets/doge.jpg -resize "100" assets/doge-small.jpg')
    //    .then(({ stdout, stderr }) => {
    //       // console.log(`Output: ${stdout}`);
 
    //       res.send(stdout)
    //    });
 }
 

 exports.getProductDet = async (req, res) => {
   con.query("SELECT CODE, Id FROM Product;", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}
 