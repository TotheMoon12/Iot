//npm module
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const read = require('read');
const http = require('http');
const crypto = require('crypto');
const multer =require('multer');
const imgFolder = '/opt/aibc/iot/web-app/server/src/uploads/';

const { PythonShell } = require("python-shell");

//CER storage config
// const upload = multer({ dest: 'uploads/'
// });
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  }),
});


const app = express();

app.use(express.static(__dirname));
app.use(morgan('combined'));
app.use(bodyParser.json({
  limit: "128mb"
}));
app.use(bodyParser.urlencoded({
  limit: "128mb",
  extended:true
}));
app.use(cookieParser());
app.use(cors());
var server = http.createServer(app);
server.listen(10023,'192.168.0.106');

const network = require('./fabric/network.js');

// promethus data array
var proTemperature = [];
var proHumidity = [];
var proGas = [];
var doorState = false;

app.get('/detect', function(req, res){
  res.sendFile(__dirname + '/detect.html');
})

app.post('/conan', function(req, res){
  console.log(req.body);
   //리눅스 원래
  var year = req.body.year;
  var month = req.body.month;
  var day = req.body.day;
  var time = req.body.time;
  var search = year + "-" + month + "-" + day + " " + time;

  fs.readdir(imgFolder, (err, filelist) => {
    let files = [];
    for(let i = 0; i < filelist.length; ++i){
        var file = filelist[i];
        //리눅스 원래
        var suffix = file.substr(0, 16);
        if(search == suffix){
            console.log(file);
            files.push("\'./uploads/" +file + "\'");
        }
    }
      let html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Image</title>
          <script>
            function handleClick()
            {
              console.log("length is ", document.body.scrollHeight);
              document.height = document.body.scrollHeight;
            }
            
          </script>
      </head>
      <body>
          <div>
              <ul id='image_list'>                
              </ul>
          </div>
          <script>
              /*socket
              result*/
              let result = [${files} ];
              let parrent = document.getElementById('image_list');
              for(let i = 0; i < result.length; ++i){
                  let image = document.createElement('img');
                  let span = document.createElement('span');
                  let button =document.createElement('button');
                  button.addEventListener("click",handleClick);
                  let child = document.createElement('li');
                  let text = result[i];
                  text = text.replace('./uploads/', '');
                  text = text.replace('.jpg', '');
                  console.log(text);
                  image.src = result[i];
                  span.innerText = text;
                  image.style.display = 'none';
                  button.appendChild(span);
                  button.onclick = function() {
                    var img=new Image();
                    img.src=result[i];
                    var img_width=500;
                    var win_width=img.width+100;
                    var img_height=500;
                    var win=img.height+100;
                    var OpenWindow=window.open('','_blank', 'width='+img_width+', height='+img_height+', menubars=no, scrollbars=auto');
                    OpenWindow.document.write("<style>body{margin:0px;}</style><img src='"+result[i]+"' width='"+win_width+"'>");
                  }
                  child.appendChild(button);
                  child.appendChild(image);
                  parrent.appendChild(child);
              }  
            </script>
            <script>
            </script>
      </body>
      </html>`
      res.send(html);
  })
})

app.get('/config', function(req,res){
  res.sendFile(__dirname + "/index.html");
});

app.post('/saveData', function(req, res){

  var key = 'saveData_'+req.body.time;
  var data = {
    temperature : req.body.temperature,
    humidity : req.body.humidity,
    gas : req.body.gas
  };

  proTemperature.push(data.temperature);
  proHumidity.push(data.humidity);
  proGas.push(data.gas);
 
  network.saveData(key, JSON.stringify(data)).then(()=>{
    res.send("Perfect");
  })
});

app.post('/detectPerson',  upload.single('file'),function(req, res){
  let sharsum = crypto.createHash('sha1');
  sharsum.update(req.file.toString());
  let fileHash = sharsum.digest('hex');
  let time = req.body.datetime;
  let user_id = req.body.user_id;
  let key = 'detect_' + time + user_id;

  network.detectPerson(key, fileHash.toString());
  res.send('good');
});


app.post('/transferConf', function(req, res) {
  let options = {
    scriptPath: "/opt/aibc/iot/web-app/server",
    args: [0,req.body.temperature, req.body.humidity, req.body.gas]
  };
  PythonShell.run("iot.py", options, function(err, data){
    if(err) throw err;
  });
  res.sendFile(__dirname + "/index.html");
});

app.post('/door', function(req, res) {
  let options = {
    scriptPath: "/opt/aibc/iot/web-app/server",
    args: [1]
  };
  PythonShell.run("iot.py", options, function(err, data){
    if(err) throw err;
  });
  res.send("good");
});

app.post('/queryDoor', function(req, res){
  res.send(doorState);
  doorState = false;
})

app.post('/openDoor', function(req, res){
  doorState = true;
  res.send(doorState);
})

app.post('/closeDoor', function(req, res){
  let options = {
    scriptPath: "/opt/aibc/iot/web-app/server",
    args: [2]
  };
  PythonShell.run("iot.py", options, function(err, data){
    if(err) throw err;
  });
  res.send(doorState);
})

app.post('/fan', function(req, res) {
  console.log('fan');
  let options = {
    scriptPath: "/opt/aibc/iot/web-app/server",
    args: [2]
  };
  PythonShell.run("iot.py", options, function(err, data){
    if(err) throw err;
  });
  res.sendFile(__dirname + "/index.html");
});

process.title = 'app';

// send blockchain process information to prometheus
app.get('/prometheus', async (req, res) => {
  if(proTemperature.length > 0)
  {
    res.send('Temperature_Sensor_Status ' + proTemperature[0][0] + '\nTemperature ' + proTemperature[0][1] +
      '\nHumidity_Sensor_Status ' + proHumidity[0][0] + '\nHumidity ' + proHumidity[0][1] +
      '\nGas_Sensor_Status ' + proGas[0][0] + '\nGas ' + proGas[0][1]);
    
    proTemperature.shift();
    proHumidity.shift();
    proGas.shift();
  }
})