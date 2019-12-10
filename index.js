const express = require('express');
var zip = require('express-zip');
const exphbs  = require('express-handlebars');
const multer = require('multer');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const base64 = require('file-base64');
const app = express();
const path = require('path');
const fs = require('fs');

let img="";
// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.originalname + '-' + Date.now() + path.extname(file.originalname));
  }
});
var upload =  multer({
  storage: storage,
  limits:{fileSize: 1000000},
})

// main Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    img: img
  });
});

app.get('/upload', (req,res)=> {
  res.redirect('/');
});

app.post('/upload',upload.array('myImage'),(req,res)=> {
  (async () => {
    const files = await imagemin(['public/uploads/*.jpg'], {
        destination: 'build/images',
        plugins: [
          imageminMozjpeg({
            quality : 75
          })
        ]
    });
    var zipImgs = []
    req.files.forEach((img , index)=>{
      zipImgs.push({path:'build/images/'+img.filename,name:'img'+index+'.jpg'})
    })
    res.zip(zipImgs,'compressed.zip',()=>{
      req.files.forEach((img , index)=>{
        fs.unlink('build/images/'+img.filename,(err)=> {
          if(err) throw err;
        });
        fs.unlink('public/uploads/'+img.filename,(err)=> {
          if(err) throw err;
        })
    })
    });
    //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
})();
})

const port = 8080;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});