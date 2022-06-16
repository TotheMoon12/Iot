const { PythonShell } = require("python-shell");
let options = {
	scriptPath: "/opt/aibc/iot/web-app/server"
};

PythonShell.run("iot.py", options, function(err, data){
	if(err) throw err;
	console.log(data);
});
