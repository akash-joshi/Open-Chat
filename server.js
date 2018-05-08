const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });
const people = {};
const sockmap = {};
//const stringHash = require('string-hash');

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
		//const id=stringHash(nick);
		if(!people.hasOwnProperty(room)){
			people[room]={};
		}
		
		people[room][socket.id] = {
			nick : nick,
			id : socket.id
		};
		sockmap[socket.id] = {
			nick : nick,
			room : room
		}
		console.log("After join : ");
		console.log(people);
		if(room=='')
			socket.emit("update", "You have connected to the default room <br/> Refresh to switch room/username");
		else	
		socket.emit("update", "You have connected to room "+room+`<br/> Refresh to switch room/username`);
		socket.emit("people-list", people[room]);
		socket.to(room).broadcast.emit("add-person",nick,socket.id);
		socket.to(room).broadcast.emit("update", nick + " has joined the server. ");
	});

	socket.on('chat message', (msg,room) => {
		io.to(room).emit('chat message', people[room][socket.id].nick,msg);
	});

	socket.on('disconnect', () => {
		if(sockmap[socket.id]){
			const room=sockmap[socket.id].room;
			socket.broadcast.emit("update", sockmap[socket.id].nick + " has disconnected. ");
			io.emit("remove-person",socket.id);
			delete people[room][socket.id];
			delete sockmap[socket.id];	
		}	
	});
});

var port = process.env.PORT || 8080;

http.listen(port, () => {
	console.log("working on port "+port);
});
