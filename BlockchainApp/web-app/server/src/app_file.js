//npm module
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const read = require('read');
const https = require('https');
const crypto = require('crypto');
const multer =require('multer');

//fabric gateway
const network = require('./fabric/network.js');

//ACL config
const ACLPath = path.join(process.cwd(), './ACL.json');
var ACLJSON = JSON.parse(fs.readFileSync(ACLPath, 'utf8'));

//CER storage config
const upload = multer({
  storage: multer.memoryStorage(),
});


// authentication data
const Deny = 0;
const Allow = 1;
const Unauth = 2;
var auth_data = {
  admin : {
  username : 'admin',
  password : ''
},
user : {
  username : 'user',
  password : ''
}
};
var Admin_cookie;
var User_cookie;

//buffer configuration
const Inactive = 0;
const Active = 1;
const Transmit = 2;
const buf_size = 100;
const max_num = 200;
const timeout = 50000000;

//insert trasaction configuration
var buf_process = Array(buf_size).fill(Inactive);
var key_buf = Array(buf_size).fill(0).map(()=> new Array(0));
var data_buf = Array(buf_size).fill(0).map(()=> new Array(0));
var timerID = Array(buf_size);
var insert_result = Array(buf_size);


//search trasaction configuration
var search_buf = Array(buf_size).fill(0).map(()=> new Array(0));
var result_buf = Array(buf_size).fill(0).map(()=> new Array(0));
var search_buf_process = Array(buf_size).fill(Inactive);
var searchTimerid = Array(buf_size);

//prometheus configuration
var current_state = 1;
var pre_time = new Date().getTime();

var insert_count = {
  'admin' : {
    'pass' : 0,
    'fail' : 0,
    'tps' : 0
  },
  'user' : {
    'pass' : 0,
    'fail' : 0,
    'tps' : 0
  }
}

var search_count = {
  'admin' : {
    'pass' : 0,
    'fail' : 0,
    'tps' : 0
  },
  'user' : {
    'pass' : 0,
    'fail' : 0,
    'tps' : 0
  }
}

var createCER_count = {
  'admin' : {
    'pass' : 0,
    'fail' : 0
  },
  'user' : {
    'pass' : 0,
    'fail' : 0
  }
}

var verify_count = {
  'admin' : {
    'pass' : 0,
    'fail' : 0
  },
  'user' : {
    'pass' : 0,
    'fail' : 0
  }
}

//express configuration
const app = express();
app.use(morgan('combined'));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json({
  limit : "128mb"
}));
app.use(bodyParser.urlencoded({
  limit: "128mb"
}));

process.title = 'app';

function initalizeServer() {
	auth_data['admin']['password'] = crypto.createHash('sha512').update(process.argv[2]).digest('hex');
	auth_data['user']['password'] = crypto.createHash('sha512').update(process.argv[3]).digest('hex');

	read({ prompt: 'Enter Server Https Password: ', silent: true }, function(er, password) {
	    const option = {
	      key: fs.readFileSync('key.pem','utf8'),
	      cert: fs.readFileSync('cert.pem','utf8'),
	      passphrase: password
	    }

	    //server start
	    https.createServer(option, app).listen(8081,() => {
	      console.log('server start');
      });
    var time = new Date().getTime();
    let data = time + auth_data['admin']['password'] + auth_data['admin']['username'];
    
    Admin_cookie = crypto.createHash('sha512').update(data).digest('hex');	
  });
}

//Server initialize
initalizeServer();

function sleep(t){
  return new Promise(resolve=>setTimeout(resolve,t));
}

//find active or inactive buffer for insertr
function get_free_buffer_index(){
	var index = buf_process.indexOf(Active);
	if(index == -1 ){
		index = buf_process.indexOf(Inactive);
	}
	return index;
}

//find active or inactive buffer for search
function search_get_free_buffer_index(){
	var index = search_buf_process.indexOf(Active);
	if(index == -1 ){
		index = search_buf_process.indexOf(Inactive);
	}
	return index;
}

// user authentication 
// 0 : permission deny, 1 : permisiion allow, 2 : not verify user
function user_auth(snack, api){
  let result = {};

  if(snack == undefined){
    result.authority = Unauth;
  }

  else if (snack==Admin_cookie){
    result.role = 'admin';
    result.authority = ACLJSON.admin[api];
  }

  else if (snack==User_cookie){
    result.role = 'user';
    result.authority = ACLJSON.user[api]
  }
  
  else {
    result.authority = Unauth;
  }

  return result;
}

//Apply new acl when updating ACL.json
fs.watchFile(ACLPath, function(curr, prev){
  ACLJSON = JSON.parse(fs.readFileSync(ACLPath, 'utf8'));
  console.log('******************************************************');
  console.log('*                                                    *');
  console.log('*                  ACL update!!!!                    *');
  console.log('*                                                    *')
  console.log('******************************************************')
});

// app.get('/',(req,res) => {
//   var time = new Date().getTime();
//   let data = time + auth_data['admin']['password'] + auth_data['admin']['username'];
      
//   Admin_cookie = crypto.createHash('sha512').update(data).digest('hex');
  
//   //cookie config
//   res.cookie('snack', Admin_cookie,{
//     httpOnly: true,
//     secure : true,
//   });
//   res.sendFile(__dirname+ '/index.html');
// });

//create cookie api
app.post('/cookie',(req,res) => {

  let response = {};
  try {
    if((crypto.createHash('sha512').update(req.body.password).digest('hex') == auth_data['admin']['password'])&&(req.body.id == auth_data['admin']['username']))
    {
      var time = new Date().getTime();
      let data = time + auth_data['admin']['password'] + auth_data['admin']['username'];
      
      Admin_cookie = crypto.createHash('sha512').update(data).digest('hex');
      
      //cookie config
      res.cookie('snack', Admin_cookie,{
        httpOnly: true,
        secure : true,
      });

      response.pass = "welcome admin";
      res.send(response);
    }

    else if((crypto.createHash('sha512').update(req.body.password).digest('hex')  == auth_data['user']['password'])&&(req.body.id == auth_data['user']['username']))
    {
      var time = new Date().getTime();
      let data = time + auth_data['user']['password'] + auth_data['user']['username'];
      User_cookie = crypto.createHash('sha512').update(data).digest('hex');
      res.cookie('snack', User_cookie,{
        httpOnly: true,
        secure : true,
      });

      response.pass = "welcome user";
      res.send(response);
    }

    else 
    {

      response.fail = 'ID, password is not match';
      res.send(response);
    }  
  } 
  catch(error) {
    let error_res = {}
    error_res.fail = `${error}`;
    res.send(error_res);
  }  
});

//insert api
app.post('/insert', async(req, res) => {

  let response = {};
  try{

    let auth = user_auth(req.cookies.snack, 'insert');
    var my_buffer_index = get_free_buffer_index();
    
    if( my_buffer_index == -1 ){
      console.log("error. not enough buffer");
      response.fail = 'Not enough buffer' 
      ++insert_count[auth.role]['fail'];
      res.send(response);
      return;
    }
  
    if(current_state == 0){
      response.fail = "Web Server's state is terminated"; 
      ++insert_count[auth.role]['fail'];
      res.send(response);
      return
    }
  
    if(auth.authority != Allow){
      if(auth.authority == Deny){
        response.fail = 'Permission denied'
        ++insert_count[auth.role]['fail'];
        res.send(response);
        return;
      }
  
      else {
        response.fail = 'Not verified user';
        ++insert_count[auth.role]['fail'];
        res.send(response);
        return;
      }
    }
  
    key_buf[my_buffer_index].push(req.body.key);
    data_buf[my_buffer_index].push(req.body.data);
  
    if(buf_process[my_buffer_index]  == Inactive){
      buf_process[my_buffer_index] = Active;
      timerID[my_buffer_index] =setTimeout(async function(){
        buf_process[my_buffer_index]  = Transmit;
        network.insert(key_buf[my_buffer_index] , data_buf[my_buffer_index] ).then((response_msg)=>{
          buf_process[my_buffer_index] = Inactive;
          let key_len = key_buf[my_buffer_index].length;
          key_buf[my_buffer_index]=[];
          data_buf[my_buffer_index]=[];
          insert_result[my_buffer_index] = response_msg;
          insert_count[auth.role][Object.keys(response_msg)[0]] += key_len;
        });
      }, timeout);
    }
  
    if(key_buf[my_buffer_index].length >= max_num){
      clearTimeout(timerID[my_buffer_index]);
      buf_process[my_buffer_index] = Transmit;
      network.insert(key_buf[my_buffer_index], data_buf[my_buffer_index]).then((response_msg)=>{
        buf_process[my_buffer_index] = Inactive;
        let key_len = key_buf[my_buffer_index].length;
        key_buf[my_buffer_index]=[];
        data_buf[my_buffer_index]=[];
        insert_result[my_buffer_index] = response_msg;
        insert_count[auth.role][Object.keys(response_msg)[0]] += key_len;
      });
  
    }
  
    while(true){
      await sleep(100);
      if(key_buf[my_buffer_index].indexOf(req.body.key)==-1){
        break;
      }
    }
    res.send(insert_result[my_buffer_index]);
  }catch(error){
    let error_res = {}
    error_res.fail = `${error}`;
    ++insert_count[auth.role]['fail'];
    res.send(error_res);
  }
});

//search api
app.post('/search', async (req,res) => {
  let response = {};
  var my_buffer_index = search_get_free_buffer_index();
  let auth = user_auth(req.cookies.snack, 'search');

  if( my_buffer_index == -1 ){
    console.log("error. not enough buffer");
    response.fail = 'Not enough buffer';
    ++search_count[auth.role]['fail'];
    res.send(response);
    return;
  }

  if(current_state == 0){
    response.fail = "Web Server's state is terminated";
    ++search_count[auth.role]['fail'];
    res.send(response);
    return
  }

  if(auth.authority != Allow){
    if(auth.authority == Deny){
      response.fail = 'Permission denied';
      ++search_count[auth.role]['fail'];
      res.send(response);
      return;
    }

    else {
      response.fail = 'Not verified user';
      ++search_count[auth.role]['fail'];
      res.send(response);
      return;
    }
  }
  
  search_buf[my_buffer_index].push(req.body.key);

  if(search_buf_process[my_buffer_index] == Inactive){
    search_buf_process[my_buffer_index] = Active;
    searchTimerid[my_buffer_index]=setTimeout(async function(){
      search_buf_process[my_buffer_index] = Transmit;
      result_buf[my_buffer_index] = await network.search(search_buf[my_buffer_index]);
      search_buf[my_buffer_index]=[];
      search_buf_process[my_buffer_index] = Inactive;
    }, timeout)
  }

  if(search_buf[my_buffer_index].length >= max_num){
    clearTimeout(searchTimerid[my_buffer_index]);
    search_buf_process[my_buffer_index] = Transmit;
    result_buf[my_buffer_index] = await network.search(search_buf[my_buffer_index]);
    search_buf[my_buffer_index]=[];
    search_buf_process[my_buffer_index] = Inactive;
  }

  try{
    let loop_count = 0;
    while(true){
      await sleep(100);
      
      if(result_buf[my_buffer_index].hasOwnProperty('pass')){
        if((result_buf[my_buffer_index].pass.hasOwnProperty(req.body.key))){
          let search_result = {'pass' : 
            {'key' : req.body.key,
            'data' : result_buf[my_buffer_index]['pass'][req.body.key]
            }
          };
          res.send(search_result);
          delete result_buf[my_buffer_index]['pass'][req.body.key];
          ++search_count[auth.role]['pass'];
          return;
      }
    }

    else if(result_buf[my_buffer_index].hasOwnProperty('fail')){
      if((result_buf[my_buffer_index].fail.hasOwnProperty(req.body.key))){
        res.send(result_buf[my_buffer_index]['fail'][req.body.key]);
        delete result_buf[my_buffer_index]['fail'][req.body.key];
        ++search_count[auth.role]['fail'];
        return;
    }
  }

      else {
        if(loop_count == 10000) {
          let error = {};
          error.fail = "Unknown error!!! "
          ++search_count[auth.role]['fail'];
          res.send(error);
          return;
        }
      }

      ++loop_count;
    }
  }catch(error){
    let error_res = {}
    error_res.fail = `${error}`;
    ++search_count[auth.role]['fail'];
    res.send(error_res);
  }
});

//insert_batch api
app.post('/insert_batch', async(req, res) => {
  let response = {};
  try{

    let auth = user_auth(req.cookies.snack, 'insert');

    if(current_state == 0){
      response.fail = "Web Server's state is terminated"; 
      ++insert_count[auth.role]['fail'];
      res.send(response);
      return
    }
  
    if(auth.authority != Allow){
      if(auth.authority == Deny){
        response.fail = 'Permission denied'
        ++insert_count[auth.role]['fail'];
        res.send(response);
        return;
      }
  
      else {
        response.fail = 'Not verified user';
        ++insert_count[auth.role]['fail'];
        res.send(response);
        return;
      }
    }

    network.insert_batch(req.body.datalist).then((response_msg)=>{
    insert_count[auth.role][Object.keys(response_msg)[0]] += req.body.datalist.length;
    res.send(response_msg);
  });

  }catch(error){
    let error_res = {}
    error_res.fail = `${error}`;
    ++insert_count[auth.role]['fail'];
    console.log(error_res);
    res.send(error_res);
  }
});

//recovery check
app.get('/Terminate', async (req,res) => {
  let response = {};
  try{
    let auth = user_auth(req.cookies.snack, 'Terminate');

    if(auth != Allow){
      if(auth == Deny){
        response.fail = 'Permission denied'; 
        res.send(response);
        return;
      }

      else {
        response.fail = 'Not verified user';
        res.send(response);
        return;
      }
    }

    current_state = 0;

    if(processing_transaction_count == 0){
      res.send(true);
    }
    else{
      res.send(false);
    }
  }catch(error){
    let error_res = {}
    error_res.fail = `${error}`;
    res.send(error_res);
  }
  
});

//createCER api
app.post('/createCER', upload.single('file'), function(req, res) {
  
  let response = {};
  try {
    let auth = user_auth(req.cookies.snack, 'createCER');
  
    if(current_state == 0){
      response.fail = "Web Server's state is terminated";
      ++createCER_count[auth.role]['fail'];
      res.send(response);
      return;
    }

    if( auth.authority != Allow){
      if(auth.authority == Deny){
        response.fail = 'Permission denied';
        ++createCER_count[auth.role]['fail']; 
        res.send(response);
        return;
      }

      else {
        response.fail = 'Not verified user';
        ++createCER_count[auth.role]['fail'];
        res.send(response);
        return;
      }
    }

    //file object
    let file = req.file

    const key = req.body.id + '_' + req.body.date + '_' + req.body.time;
    const hash = crypto.createHash('sha512');
    hash.update(JSON.stringify(file.buffer));

    let data = {
      "TraderID" : req.body.id,
      "DATEKEY" : req.body.date,
      "TIMEKEY" : req.body.time,
      "FINGERPRINT" : hash.digest('hex'),
    };

    network.createCER(key, JSON.stringify(data)).then((response_msg)=>{
      ++createCER_count[auth.role][Object.keys(response_msg)[0]];
      res.send(response_msg);
    });
  }
  catch (error){
    let error_res = {}
    error_res.fail = `${error}`;
    ++createCER_count[auth.role]['fail'];
    res.send(error_res);
  }    
});

//verify api
app.post('/verify', upload.single('verify_File'), function(req, res, next) {

  let response = {};

  try{

    let auth = user_auth(req.cookies.snack, 'verify');

    if(current_state == 0){
      response.fail = "Web Server's state is terminated";
      ++verify_count[auth.role]['fail'];
      res.send(response);
      return
    }
    
    if(auth.authority != Allow){
      if(auth.authority == Deny){
        response.fail = 'Permission denied';
        ++verify_count[auth.role]['fail'];
        res.send(response);
        return;
      }
  
      else {
        response.fail = 'Not verified user';
        ++verify_count[auth.role]['fail'];
        res.send(response);
        return;
      }
    }
  
     //file object
    let file = req.file
  
    const key = req.body.id + '_' + req.body.date + '_' + req.body.time;
    const hash = crypto.createHash('sha512');
    hash.update(JSON.stringify(file.buffer));
    network.verify(key, hash.digest('hex')).then((response_msg)=>{
      ++verify_count[auth.role][Object.keys(response_msg)[0]];
      res.send(response_msg);
    });
  }
  catch(error) {
    let error_res = {}
    error_res.fail = `${error}`;
    ++verify_count[auth.role]['fail'];
    res.send(error_res);
  }
});

//Inform prometheus
app.get('/prometheus', async (req,res) => {
  try{
  let current_time = new Date().getTime();
  let time = (current_time-pre_time)/1000;
  pre_time = current_time;

  insert_count.admin.tps = insert_count.admin.pass/time;
  insert_count.user.tps = insert_count.user.pass/time;
  search_count.admin.tps = search_count.admin.pass/time;
  search_count.user.tps = search_count.user.pass/time;

  res.send('Admin_pass_insert ' + insert_count.admin.pass + '\nAdmin_fail_insert ' + insert_count.admin.fail +
   '\nAdmin_pass_tps_insert ' + insert_count.admin.tps + '\nUser_pass_insert ' + insert_count.user.pass +
   '\nUser_fail_insert ' + insert_count.user.fail + '\nUser_pass_tps_insert ' + insert_count.user.tps +
   '\nAdmin_pass_search ' + search_count.admin.pass + '\nAdmin_fail_search ' + search_count.admin.fail +
   '\nAdmin_pass_tps_search ' + search_count.admin.tps + '\nUser_pass_search ' + search_count.user.pass +
   '\nUser_fail_search ' + search_count.user.fail + '\nUser_pass_tps_search ' + search_count.user.tps + 
   '\nAdmin_pass_createCER ' + createCER_count.admin.pass + '\nAdmin_fail_createCER ' + createCER_count.admin.fail + 
   '\nUser_pass_createCER ' + createCER_count.user.pass +'\nUser_fail_createCER ' + createCER_count.user.fail + 
   '\nAdmin_pass_verify ' + verify_count.admin.pass + '\nAdmin_fail_verify ' + verify_count.admin.fail + 
   '\nUser_pass_verify ' + verify_count.user.pass + '\nUser_fail_verify ' + verify_count.user.fail + '\nstate ' + current_state);

  insert_count = {
    'admin' : {
      'pass' : 0,
      'fail' : 0
    },
    'user' : {
      'pass' : 0,
      'fail' : 0
    }
  }

search_count = {
    'admin' : {
      'pass' : 0,
      'fail' : 0
    },
    'user' : {
      'pass' : 0,
      'fail' : 0
    }
  }
}catch(error){
  console.log(error);
  res.send(error);
}
});
