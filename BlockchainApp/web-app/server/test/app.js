const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser')
const app = express();
const imgFolder = "./uploads/";
const fs = require('fs');

app.use(express.static(path.join(__dirname,'/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

var server = http.createServer(app);
server.listen(10023, 'localhost');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/detect.html');
})

app.post('/conan', function(req, res){
    console.log(req.body);
    let time = req.body.time;
    fs.readdir(imgFolder, (err, files) => {
        
        for(let i = 0; i < files.length; ++i)
        {
            files[i] = "\'uploads/" +files[i] + "\'";
        }
        console.log(files.toString());
        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Image</title>
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
                    let child = document.createElement('li');
                    let text = result[i];
                    text = text.replace('./uploads/', '');
                    text = text.replace('.jpg', '');
                    console.log(text);
                    image.src = result[i];
                    span.innerText = text;
                    image.style.display = 'none';
                    button.appendChild(span);
                    button.onclick = function(){
                        if(image.style.display == 'none') image.style.display = 'block';
                        else image.style.display = 'none';
                    }
                    child.appendChild(button);
                    child.appendChild(image);
                    parrent.appendChild(child);
                }  
              </script>
        </body>
        </html>`
        res.send(html);
    })
})