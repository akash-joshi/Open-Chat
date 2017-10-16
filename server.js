var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });
var people = {};
var stringHash = require('string-hash');

// Attach session
app.use(session);

app.get('/', (req,res) => {
	res.sendFile(__dirname+"/index.html");
});

app.get('/style.css', (req,res) => {
	res.sendFile(__dirname+"/style.css");
});

app.get('/main.js', (req,res) => {
	res.sendFile(__dirname+"/main.js");
});

io.on('connection', function(socket){
	socket.on("join", (nick) => {
		console.log(" " + people[socket.id]+" connected");
		people[socket.id] = {
			nick : nick,
			id : stringHash(nick)
		};
		console.log(people);
		socket.emit("update", "You have connected to server.");
		socket.emit("people-list", people);
		socket.broadcast.emit("add-person",nick);
		socket.broadcast.emit("update", nick + " has joined the server. ");
	});

	socket.on('chat message', (msg) => {
		io.emit('chat message', people[socket.id].nick,msg);
	});

	socket.on('disconnect', () => {
		if(people[socket.id]){
			socket.broadcast.emit("update", people[socket.id].nick + " has disconnected. ");
			io.emit("remove-person",people[socket.id].id);
			console.log("Remove : "+people[socket.id].id);
			delete people[socket.id];	
		}	
	});
});

var port = process.env.PORT || 8080;

http.listen(port, function () {
	console.log("working on port "+port);
});
