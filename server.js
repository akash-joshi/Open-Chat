var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });
var people = {};

// Attach session
app.use(session);

app.get('/', function(req,res){
	res.sendFile(__dirname+"/index.html");
});

app.get('/style.css', function(req,res){
	res.sendFile(__dirname+"/style.css");
});

io.on('connection', function(socket){
	socket.on("join", function(nick){
		console.log(" " + people[socket.id]+" connected");
		people[socket.id] = nick;
		console.log(people);
		socket.emit("update", "You have connected to server.");
		socket.emit("people-list", people);
		socket.broadcast.emit("update", nick + " has joined the server. ");
	});

	socket.on('chat message', function(msg){
		io.emit('chat message', people[socket.id],msg);
		console.log(people[socket.id]+': message: '+msg);
	});
	socket.on('disconnect', function(){
	socket.broadcast.emit("update", people[socket.id] + " has disconnected. ");
		console.log(people[socket.id]+' disconnected');
		delete people[socket.id];
		socket.emit("people-list",people);
	});
});

var port = process.env.PORT || 8080;

http.listen(port, function () {
	console.log("working on port "+port);
});
