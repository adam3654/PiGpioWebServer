var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var url = require('url');
var path = require('path');
var io = require('socket.io','net')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

/****** CONSTANTS******************************************************/

const WebPort = 80;
const ioPorts = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
const eStopInputPin = new Gpio(20, 'in', 'both');
var OkToEnable = false;
var OkToFire = false;



eStopInputPin.watch((err, value) => {
	if (value) {
		OkToEnable = true;
		socket.emit("DisableButtons",0);
		OkToFire = false;
	} else {
		OkToFire = true;
	}
});

//get initial state of pin
let initialState = eStopInputPin.readSync();
if (initialState == false) {
	//server started with safety relay 'off' (12v to firing relays)
	OkToFire = true;
	OkToEnable = true;
}
class IoPin {
	gpio;
	name;
	value;

	constructor(pin) {
		this.name = `GPIO${pin}`;
		this.gpio = new Gpio(parseInt(pin), 'low'); //use GPIO pin as output, default low
		this.value = 0;
	}
	Read() {
		this.value = this.gpio.readSync();
		return this.value;
	}
	Write(val) {
		if (val === 1 || val === 0) {
			this.gpio.writeSync(val);
			this.value = val;
		}	
	}
	Destroy(){
		this.gpio.unexport();
	}

}

let i = 0
for (const pinNum in ioPorts) {
	if (i === 0) {
		var gpioPins = new Array ([new IoPin(pinNum)]);		
	} else {
		gpioPins.push(new IoPin(pinNum));
	}
	i++;
}

function FireOnPin(pin) {
	let pinIndex = ioPorts.indexOf(pin);
	gpioPins[pinIndex].Write(1);
	setTimeout(turnOffPin(gpioPins[pinIndex]),500);
}

function turnOffPin(ioPin) {
	ioPin.Write(0);
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/* if you want to run WebPort on a port lower than 1024 without running
 * node as root, you need to run following from a terminal on the pi
 * sudo apt update
 * sudo apt install libcap2-bin
 * sudo setcap cap_net_bind_service=+ep /usr/local/bin/node
 */
 
/*************** Web Browser Communication ****************************/



// Start http webserver
http.listen(WebPort, function() {  // This gets call when the web server is first started.
	let pLen = gpioPins.length;

	for (let i = 0; i < pLen; i++) {
		gpioPins[i].Write(0);
	}
	console.log('Server running on Port '+WebPort);

	for (let i = 0; i < pLen; i++) {
		console.log(`${gpioPins[i].name} = ${gpioPins[i].value}`);
	}
} 
); 



// function handler is called whenever a client makes an http request to the server
// such as requesting a web page.
function handler (req, res) { 
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    console.log('filename='+filename);
    var extname = path.extname(filename);
    if (filename=='./') {
      console.log('retrieving default index.html file');
      filename= './index.html';
    }
    
    // Initial content type
    var contentType = 'text/html';
    
    // Check ext and set content type
    switch(extname) {
	case '.js':
	    contentType = 'text/javascript';
	    break;
	case '.css':
	    contentType = 'text/css';
	    break;
	case '.json':
	    contentType = 'application/json';
	    break;
	case '.png':
	    contentType = 'image/png';
	    break;
	case '.jpg':
	    contentType = 'image/jpg';
	    break;
	case '.ico':
	    contentType = 'image/png';
	    break;
    }
    

    
    fs.readFile(__dirname + '/public/' + filename, function(err, content) {
	if(err) {
	    console.log('File not found. Filename='+filename);
	    fs.readFile(__dirname + '/public/404.html', function(err, content) {
		res.writeHead(200, {'Content-Type': 'text/html'}); 
		return res.end(content,'utf8'); //display 404 on error
	    });
	}
	else {
	    // Success
	    res.writeHead(200, {'Content-Type': contentType}); 
	    return res.end(content,'utf8');
	}
      
    });
}



// Execute this when web server is terminated
process.on('SIGINT', function () { //on ctrl+c

	let pLen = gpioPins.length;

	for (let i = 0; i < pLen; i++) {
		gpioPins[i].Write(0); // Turn LED off
		gpioPins[i].Destroy(); // Unexport GPIO to free resources
	}
	eStopInputPin.unexport();

  process.exit(); //exit completely
}); 


/****** io.socket is the websocket connection to the client's browser********/

io.sockets.on('connection', function (socket) {// WebSocket Connection
    console.log('A new client has connectioned. Send GPIO status');

	//let pLen = gpioPins.length;

	// for (let i = 0; i < pLen; i++) {
	// 	socket.emit(gpioPins[i].name, gpioPins[i].value);
	// }

	socket.on('pin', function(data) {
		let pinNum = data.value;
		if (OkToFire) FireOnPin(pinNum);		
	});

	socket.on('Enable', function(data) {
		if (OkToFire && OkToEnable) {
			socket.emit("EnableFireOK", 1);
			OkToEnable = false;
		} 
	});

	socket.on('Sequential', function(data) {
		if (OkToFire) {
			socket.emit("DisableButtons",0);
			let firstShot = true;
			let pLen = gpioPins.length;
			let delay = 2000;
			for (let i = 0; i < pLen; i++) {
				if (firstShot) {
					FireOnPin(ioPorts[i]);
					firstShot = false;	
				} else {
					if (dataVal === "Random") {			
						delay = getRandomInt(500,4000);
					} else {
						delay = data.value;
					}
					setTimeout(FireOnPin(ioPorts[i]), delay);			
				}
			}
			OkToFire = false;
		}		
	});

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
	console.log('A user disconnected');
    });
}); 




 



