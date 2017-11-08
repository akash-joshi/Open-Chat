const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });
const people = {};
const stringHash = require('string-hash');

// Attach session
app.use(session);

app.get('/', (req,res) => {
	res.sendFile(__dirname+"/index.html");
});

app.get('/css/:fileName', (req, res) => {
	res.sendFile(__dirname+'/css/'+req.params.fileName);
});

app.get('/main.js', (req,res) => {
	res.sendFile(__dirname+"/main.js");
});

io.on('connection', (socket) => { 
	socket.on("join", (nick,room) => {
		socket.join(room);
		console.log(" " + people[socket.id]+" connected");
		const id=stringHash(nick);
		people[socket.id] = {
			nick : nick,
			id : id,
			room : room
		};
		console.log(people);
		socket.emit("update", "You have connected to room "+room);
		socket.emit("people-list", people);
		socket.to(room).broadcast.emit("add-person",nick,id);
		socket.to(room).broadcast.emit("update", nick + " has joined the server. ");
	});

	socket.on('chat message', (msg,room) => {
		io.to(room).emit('chat message', people[socket.id].nick,msg);
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

http.listen(port, () => {
	console.log("working on port "+port);
});
