var express = require('express')
var app = express()
var mongo = require('mongojs')
var db = mongo('tasks')

var ejs = require('ejs')
var moment = require('moment-timezone');
var serialPort = require("serialport");

var server = require('http').createServer(app)
var io = require('socket.io').listen(server)

var ObjectId = mongo.ObjectID;

//app.use(app.router)
app.use(express.static(__dirname + '/public'))
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

server.listen(process.env.PORT | 3000, function () {
  console.log('Example app listening on port 3000!')
})

/*app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
*/

// serial port initialization:

var MAX_DEGREES = 30

var portConfig = {
	baudRate: 9600,
	// call myPort.on('data') when a newline is received:
	parser: serialPort.parsers.readline('\n')
};

//var serialport = new serialPort("/dev/tty.usbmodem1421", portConfig);

connections = []
var tasks = db.collection('tasks');
var alarms = db.collection('alarms');

app.get('/', function(req, res){
	console.log('going 🏡 buddy')
	res.render('pages/index.ejs');
});

app.get('/tasks', function(req, res){
	console.log('I recieved a GET request');

	tasks.find().sort({date_created: -1}, function(err, docs){
		for (var i=0; i<docs.length; i++) {
			docs[i].percentage = 100*docs[i].current / docs[i].goal;
			docs[i].date_created = moment(docs[i].date_created).tz("America/Santiago").calendar();
		}

		res.json(docs);
	});
});

app.get('/alarms/:alarmID', function(req, res){
	console.log('I recieved a GET request', req.params);

	alarms.findOne({'_id': ObjectId(req.params.alarmID)}, function(err, response){
		console.log(res);
		var date_created = moment(response.date_created).tz("America/Santiago").calendar();
		res.render('pages/alarms.ejs', {lon: response.location.lon, lat: response.location.lat, _id: response._id, date_created: date_created});
	});

});

/* sockets */

/*serialport.on('open', function(){
  // Now server is connected to Arduino
  console.log('Serial Port Opend');

  var lastValue;
  io.sockets.on('connection', function (socket) {
	  //Connecting to client 
	  console.log('Socket connected');
	  socket.emit('connected');
	  
	  var stop = false;

	  serialport.on('data', function(data){

	  		var realDegrees = parseFloat(data);

	  		console.log(realDegrees);

	  		if(realDegrees > MAX_DEGREES && !stop){

	  			alarms.insert({
					date_created: new Date(),
					location: {
						lat: -33.066960,
						lon: -71.593711
					}
				},
				function(err, records){
					if(err){
						console.warn(err)
					}

					else{
						console.warn('emitting new alarm');
						console.log(records)

						socket.emit('new_alarm', {msg: records});

						stop = true;
					}
				});
				
	  		}

	  });
  });

});*/

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('connected: %s sockets connected', connections.length);

	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);
		console.log('disconnected: %s sockets connected', connections.length);
	});

	socket.on('new_alarm', function(data){

		console.log('recieved new alarm')

		alarms.insert({
			date_created: new Date(),
			location: {
				lat: -33.066960,
				lon: -71.593711
			}
		},
		function(err, records){
			if(err){
				console.warn(err)
			}

			else{
				console.log('new alarm')
				console.log(records)

				io.sockets.emit('new_alarm', {msg: records});
			}
		});
	});

	socket.on('new_task', function(data){

		console.log('recieved new task')
		console.log(data);

		tasks.insert({
				name: data.name, 
				date_created: new Date(), 
				goal: data.goal,
				description: data.description, 
				current: 0, 
				location : {
					latitude : -26.347308,
					longitude : -70.61639
				},
				by: 'cruz roja'
		}, 
		function(err, records){
			if(err){
				console.warn(err)
			}

			else{
				console.log('new task')
				console.log(records)

				io.sockets.emit('new_task', {msg: records});
			}
		});
	});

	socket.on('update_task', function(data){
		console.log(data);

		tasks.find({_id : ObjectId(data.id)}, function(err, task){

			var percentage = 100*task[0].current / task[0].goal

			console.log(percentage)

			if(percentage < 100){

				tasks.findAndModify({
					query: {'_id': ObjectId(data.id)},
					update: { $inc: { current: 1 }}, 
					new: true, 
					upsert: true 
					},
					function(err, doc){
						doc.percentage = 100*doc.current / doc.goal

						if (doc.percentage < 25){
							doc.progressClass = 'progress-bar-danger'
						}

						else if (doc.percentage < 50){
							doc.progressClass = 'progress-bar-warning'
						}

						else if (doc.percentage < 95){
							doc.progressClass = 'progress-bar-info'
						}

						else{
							doc.progressClass = 'progress-bar-success'
							io.sockets.emit('task_completed', {msg: doc});
						}

						io.sockets.emit('update_task', {msg: doc});
				});
			}

			else{
				console.warn('task already completed')
			}

		})


	});

});