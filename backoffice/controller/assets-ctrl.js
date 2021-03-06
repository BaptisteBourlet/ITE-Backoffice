
const { DB } = require('../database')
const mysql = require('mysql');

const fs = require('fs');
const appRoot = require('app-root-path');
const imagemagickCli = require('imagemagick-cli');
const { writeFile: writeFileCallback } = require('fs');
const { promisify } = require('util');
const writeFileP = promisify(writeFileCallback);

const con = mysql.createConnection({
   ...DB,
   multipleStatements: true,
})


exports.getAssets = async (req, res) => {
   const query = 'SELECT Assets.Id, Assets.ProductId, Type, Path, Label, Sequence, Product.CODE, ProductInfo.Catalog FROM Assets'
      + " LEFT JOIN Product ON Product.Id = Assets.ProductId"
      + " LEFT JOIN ProductInfo ON ProductInfo.ProductId = Product.Id WHERE ProductInfo.Language = 'en' AND Path NOT Like '%-small%' "
      + "AND Path NOT Like '%-thumb%' AND Path NOT Like '%-medium%' AND Path NOT Like '%-large%'"
      + "ORDER BY Assets.ProductId;"

   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}


exports.searchAssetsProduct = async (req, res) => {
   const { searchQuery } = req.body;

   const query = 'SELECT Assets.Id, Assets.ProductId, Type, Path, Label, Sequence, Product.CODE, ProductInfo.Catalog FROM Assets'
      + " LEFT JOIN Product ON Product.Id = Assets.ProductId"
      + ` LEFT JOIN ProductInfo ON ProductInfo.ProductId = Product.Id WHERE ProductInfo.Language = 'en' AND Product.CODE LIKE '%${searchQuery}%' `
      + " AND Path NOT Like '%-small%'"
      + " AND Path NOT Like '%-thumb%' AND Path NOT Like '%-medium%' AND Path NOT Like '%-large%'"
      + " ORDER BY Assets.ProductId;";

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
      + " LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = Series.Sid WHERE SeriesInfo.Language = 'en'"
      + " AND Path NOT Like '%-small%'"
      + " AND Path NOT Like '%-thumb%' AND Path NOT Like '%-medium%' AND Path NOT Like '%-large%'"
      + " ORDER BY Assets.SerieId;"

   con.query(query, (err, result) => {
      if (err) throw err;

      res.send(result);
   })
}

exports.searchAssetsSeries = async (req, res) => {
   const { searchQuery } = req.body;

   const query = 'SELECT Assets.Id, Assets.SerieId, Type, Path, Label, Sequence, Series.Key, SeriesInfo.Title FROM Assets'
      + " LEFT JOIN Series ON Series.Sid = Assets.SerieId"
      + ` LEFT JOIN SeriesInfo ON SeriesInfo.SeriesId = Series.Sid WHERE SeriesInfo.Language = 'en' AND Series.Key LIKE '%${searchQuery}%' `
      + " AND Path NOT Like '%-small%'"
      + " AND Path NOT Like '%-thumb%' AND Path NOT Like '%-medium%' AND Path NOT Like '%-large%'"
      + " ORDER BY Assets.SerieId;";

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

exports.addAssets = async (req, res) => {
   const { ProductId, SerieId, Type, Path, Label, Sequence } = req.body;

   if (SerieId == undefined || SerieId == '' || SerieId == null) {
      SerieId = 0
      con.query(`INSERT INTO Assets (ProductId, SerieId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "${SerieId}", "${Type}", "${Path}", "${Label}", "${Sequence}");`, (err, results, fields) => {
         if (err) {
            console.log(err)
         }
         res.send(results)
      })
   } else {
      con.query(`INSERT INTO Assets (ProductId, SerieId, Type, Path, Label, Sequence) VALUES ("${ProductId}", "${SerieId}", "${Type}", "${Path}", "${Label}", "${Sequence}");`, (err, results, fields) => {
         if (err) {
            console.log(err)
         }
         res.send(results)
      })
   }
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
   const { itemId, PathJPG } = req.body;
   
   let arrayPath = PathJPG.split('.')
   
   let smallPath = arrayPath[0] + '-small.' + arrayPath[1]
   let largePath = arrayPath[0] + '-large.' + arrayPath[1]
   let mediumPath = arrayPath[0] + '-medium.' + arrayPath[1]
   let thumbPath = arrayPath[0] + '-thumb.' + arrayPath[1]
   
   if (fs.existsSync(appRoot + `/assets/${PathJPG}`)) {
      fs.unlink(appRoot + `/assets/${PathJPG}`, function (err) {
         if (err) throw err;
         // if no error, file has been deleted successfully
         
         if (fs.existsSync(appRoot + `/assets/${smallPath}`)) {
            fs.unlink(appRoot + `/assets/${smallPath}`, function (err) {
               if (err) throw err;
               // if no error, file has been deleted successfully
               
            })
         }
         if (fs.existsSync(appRoot + `/assets/${largePath}`)) {
            fs.unlink(appRoot + `/assets/${largePath}`, function (err) {
               if (err) throw err;
               // if no error, file has been deleted successfully
              
            })
         }
         if (fs.existsSync(appRoot + `/assets/${mediumPath}`)) {
            fs.unlink(appRoot + `/assets/${mediumPath}`, function (err) {
               if (err) throw err;
               // if no error, file has been deleted successfully
              
            })
         }
         if (fs.existsSync(appRoot + `/assets/${thumbPath}`)) {
            fs.unlink(appRoot + `/assets/${thumbPath}`, function (err) {
               if (err) throw err;
               // if no error, file has been deleted successfully
               
            })
         }
         con.query(`DELETE FROM Assets WHERE Id = ${itemId};`, (err, results, fields) => {
            if (err) {
               console.log(err);
            }

            res.send(results)
         })
      });
   } else {
      con.query(`DELETE FROM Assets WHERE Id = ${itemId};`, (err, results, fields) => {
         if (err) {
            console.log(err);
         }

         res.send(results)
      })
      console.log('Sorry, File does not exists!');
   }

}

// upload and save image done by upload middleware, check api-routes.
// after image saved, it will be resized and paths will be saved to Assets database here 
exports.uploadProductImage = async (req, res) => {
   let nextSequence, landscape;
   const { originalname } = req.file;
   const { ProductId, Label } = req.body;
   const maxSequence = `SELECT MAX(Sequence) AS maxSequence FROM Assets WHERE ProductId = "${ProductId}"`;

   const check = originalname.split('.')
   const pathpng = `assets/${check[0]}-large.PNG`
   const pathjpg = `assets/${check[0]}-large.JPG`

   if (fs.existsSync(pathpng) || fs.existsSync(pathjpg)) {
      res.send({ isExist: "yes" })
   } else {
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
}


// upload and save image done by upload middleware, check api-routes.
// after image saved, it will be resized and paths will be saved to Assets database here 
exports.uploadSerieImage = async (req, res) => {

   let nextSequence, landscape;
   const { originalname } = req.file;
   const { SeriesId, Label } = req.body;
   const maxSequence = `SELECT MAX(Sequence) AS maxSequence FROM Assets WHERE SerieId = "${SeriesId}"`;
   const check = originalname.split('.')
   const pathpng = `assets/${check[0]}-large.PNG`
   const pathjpg = `assets/${check[0]}-large.JPG`

   if (fs.existsSync(pathpng) || fs.existsSync(pathjpg)) {
      res.send({ isExist: "yes" })
   } else {
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
   const check = originalname.split('.')
   const pathpng = `assets/${check[0]}-large.PNG`
   const pathjpg = `assets/${check[0]}-large.JPG`

   if (oldPath != originalname) {
      if (fs.existsSync(appRoot + `/assets/${oldPath}`)) {

         fs.unlink(appRoot + `/assets/${oldPath}`, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully

         });
      }
   }

   if (fs.existsSync(pathpng) || fs.existsSync(pathjpg)) {
      res.send({ isExist: "yes" })
   } else {
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
            res.status(200).send({ ...result, success: true, file: originalname })

         })

         // imagemagickCli
         //    .exec(`identify assets/${originalname}`)
         //    .then(({ stdout, stderr }) => {
         //       let dimensions = stdout.split(' ')[2].split('x');
         //       const width = dimensions[0];
         //       const height = dimensions[1];
         //       landscape = parseInt(width) > parseInt(height) ? true : false;

         //       // insert other sizes
         //       imageSizes.forEach(size => {
         //          let newName = originalname.split('.');
         //          newName[0] = `${newName[0]}-${size.size}`;
         //          newName = newName.join('.');

         //          // set maxWidth or maxHeight depending on image type
         //          let resizeOption = landscape ? `${size.width}` : `x${size.height}`;
         //          imagemagickCli
         //             .exec(`convert assets/${originalname} -resize "${resizeOption}" assets/${newName}`)
         //             .then(({ stdout, stderr }) => {
         //                const insertAssets = `UPDATE Assets SET ProductId= "${ProductId}" , Type = "product-image", Path = "${newName}", Label = "${Label}", Sequence = "${nextSequence}" WHERE Assets.Path LIKE "${test.join('') + '-' + size.size}%" AND ProductId = ${ProductId};`

         //                con.query(insertAssets, (err, result) => {
         //                   if (err) throw err;

         //                   if (size.size === "large") {
         //                      res.status(200).send({ ...result, success: true, file: originalname });
         //                   }
         //                })
         //             });
         // })
         // });
      })
   }
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
   const check = originalname.split('.')
   const pathpng = `assets/${check[0]}-large.PNG`
   const pathjpg = `assets/${check[0]}-large.JPG`



   if (oldPath != originalname) {
      if (fs.existsSync(appRoot + `/assets/${oldPath}`)) {

         fs.unlink(appRoot + `/assets/${oldPath}`, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully

         });
      }
   }

   if (fs.existsSync(pathpng) || fs.existsSync(pathjpg)) {
      res.send({ isExist: "yes" })
   } else {
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
            res.status(200).send({ ...result, success: true, file: originalname })
         })

         // Check if image is landscape;

         // imagemagickCli
         //    .exec(`identify assets/${originalname}`)
         //    .then(({ stdout, stderr }) => {
         //       if (stderr) throw stderr;

         //       let dimensions = stdout.split(' ')[2].split('x');
         //       const width = dimensions[0];
         //       const height = dimensions[1];
         //       landscape = parseInt(width) > parseInt(height) ? true : false;

         // insert other sizes
         // imageSizes.forEach(size => {
         //    let newName = originalname.split('.');

         //    newName[0] = `${newName[0]}-${size.size}`;
         //    newName = newName.join('.');

         //    // set maxWidth or maxHeight depending on image type
         //    let resizeOption = landscape ? `${size.width}` : `x${size.height}`;
         //    imagemagickCli
         //       .exec(`convert assets/${originalname} -resize "${resizeOption}" assets/${newName}`)
         //       .then(({ stdout, stderr }) => {

         //          const insertAssets = `UPDATE Assets SET SerieId = "${SeriesId}", Type = "serie-image", Path = "${newName}", Label = "${Label}", Sequence = "${nextSequence}" WHERE SerieId = ${SeriesId} AND Assets.Path LIKE "${test.join('') + '-' + size.size}%";`

         //          con.query(insertAssets, (err, result) => {
         //             if (err) throw err;
         //             if (size.size === "large") {
         //                res.status(200).send({ ...result, success: true, file: originalname });
         //             }
         //          })
         //       })
         // })
         // })

      })
   }
}


exports.getProductDet = async (req, res) => {
   con.query("SELECT CODE, Id FROM Product;", (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}


exports.convertImages = async (req, res) => {
   req.setTimeout(5 * 60 * 1000);  // 5mins
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

   // create folders if not exists
   imageSizes.forEach(size => {
      let folder = appRoot + '/assets/' + size.size;

      if (!fs.existsSync(folder)) {
         fs.mkdirSync(folder)
      }
   })
   // loop throuhg all files in ASSETS folder
   // get file name from database, check if it exists on ASSETS
   // if EXISTS, resize
   // if NOT, write to error.txt

   // get all path from database;

   const allAssets = `SELECT * FROM Assets;`

   con.query(allAssets, (err, results) => {
      if (err) throw err;
      let i = 0;
      let limit = results.length;
      // res.send(results);
      let interval = setInterval(() => {
         if (i === limit) {
            res.status(200).send({ success: true });
            clearInterval(interval);
            return;
         }

         const { MasterId, Path, ProductId, SerieId, Type, Label, Sequence } = results[i];

         fs.stat(`${appRoot}/assets/${Path}`, (err, data) => {  // check if file exist in folder
            if (err) {  // if not, add log to fileErrors.txt
               let content = `\r "${Path}",`;
               fs.appendFile(appRoot + '/assets/' + 'fileErrors.txt', content, function (err) {
                  i++;
               });
            } else {
               // this checks if file has been genereted to other sizes or not
               // if not, generate other sizes
               fs.stat(`${appRoot}/assets/small/${Path}`, (err, data) => {
                  if (err) {
                     // RESIZE AND ADD TO DATABASE
                     let insertAssets = '';
                     let fileName = Path;
                     imagemagickCli
                        // .exec(`identify assets/${exist[0].Path}`)
                        .exec(`identify assets/${fileName}`)
                        .then(({ stdout, stderr }) => {
                           let dimensions = stdout.split(' ')[2].split('x');
                           const width = dimensions[0];
                           const height = dimensions[1];
                           let landscape = parseInt(width) > parseInt(height) ? true : false;

                           // insert other sizes
                           imageSizes.forEach(size => {
                              // set maxWidth or maxHeight depending on image type
                              let resizeOption = landscape ? `${size.width}` : `x${size.height}`;
                              let sizeChar = size.size.charAt(0).toUpperCase();

                              imagemagickCli
                                 .exec(`convert assets/${fileName} -resize "${resizeOption}" assets/${size.size}/${fileName}`)
                                 .then(({ stdout, stderr }) => {

                                    if (Type === 'serie-image') {
                                       insertAssets = `INSERT INTO Assets (MasterId, SerieId, Type, Size, Path, Label, Sequence) VALUES ("${MasterId}", "${SerieId}", "${Type}", "${sizeChar}" ,"${size.size}/${fileName}", "${Label}", "${Sequence}");`
                                    } else {
                                       insertAssets = `INSERT INTO Assets (MasterId, ProductId, Type, Size, Path, Label, Sequence) VALUES ("${MasterId}", "${ProductId}", "${Type}", "${sizeChar}" ,"${size.size}/${fileName}", "${Label}", "${Sequence}");`
                                    }

                                    con.query(insertAssets, (err, result) => {
                                       if (err) throw err;
                                    })
                                 });
                           })
                        });
                     i++;
                  } else {
                     i++;
                  }
               })
            }
         })
      }, 200)
   }) //end of querying all Assets
}
// Assets.CategoryId,
exports.getCategoryAssets = async (req, res) => {
   
   const query = "SELECT C.Id, C.WorkingTitle AS Name, IT.Tree, Path FROM Category C"
      + " LEFT JOIN Assets ON CatId = C.Id"
      + " LEFT JOIN InfoTree IT ON C.Id = IT.LinkId and IT.Publish = '1' and IT.Type = 'C' WHERE C.Publish = '1'"
   con.query(query, (err, result) => {
      if (err) throw err;
      res.send(result);
   })
}

exports.searchAssetsCat = async (req, res) => {
   const { searchQuery } = req.body;
   const query = "SELECT C.Id, C.WorkingTitle AS Name, IT.Tree, Path FROM Category C"
      + " LEFT JOIN Assets ON CatId = C.Id"
      + ` LEFT JOIN InfoTree IT ON C.Id = IT.LinkId and IT.Publish = '1' and IT.Type = 'C' WHERE C.WorkingTitle LIKE '%${searchQuery}%' AND C.Publish = '1'`

   con.query(query, (err, results, fields) => {
      if (err) {
         console.log(err)
      }
      res.send(results)
   })
}

exports.addCatAssets = async (req, res) => {

   const { CatId, Path, VisualFile, oldImage } = req.body;
   const existCat = `SELECT COUNT(*) AS CatCount FROM Assets WHERE CatId = ${CatId};`;

   let newName = Path.split('\\');

   if (fs.existsSync(appRoot + `/assets/${oldImage}`)) {

      fs.unlink(appRoot + `/assets/${oldImage}`, function (err) {
         if (err) throw err;
         // if no error, file has been deleted successfully
         

      });
   }
   if (newName != oldImage) {
      fs.writeFile(appRoot + `/assets/${newName[2]}`, VisualFile, { encoding: 'base64' }, function (err) {
         
      });
   }


   con.query(existCat, (err, transResult) => {
      if (err) throw err;
      if (transResult[0].CatCount > 0) {
         con.query(`UPDATE Assets SET Path = "${newName[2]}" WHERE CatId = ${CatId} ;`, (err, results, fields) => {
            if (err) throw err;
            res.send(results)
         });
      } else {
         con.query(`INSERT INTO Assets (CatId, Path, Type) VALUES ( "${CatId}", "${newName[2]}", "Category-image");`, (err, results, fields) => {
            if (err) {
               console.log(err)
            }

            res.send(results)
         })
      }
   })

}