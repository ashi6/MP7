var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static("static"));

var room = io.of("/");

var players = {};

var getSpawn = function () {
	return [Math.floor(Math.random() * 5000) / 10 - 250, Math.floor(Math.random() * 5000) / 10 - 250];
};

var randomColor = function () {
	return `hsl(${Math.random() * 360}, 100%, 50%)`;
};

io.on("connection", function (socket) {
	console.log(socket.client.id + " joined");
	var playerData = {
		id: socket.id,
		position: getSpawn(),
		velocity: [0, 0],
		color: randomColor()
	};
	socket.emit("init", playerData);
	socket.broadcast.emit("join", playerData);

	for (var id in players) {
		if (players.hasOwnProperty(id)) {
			socket.emit("join", players[id]);
		}
	}

	players[socket.id] = playerData;

	socket.on("disconnect", function (data) {
		console.log(socket.client.id + " left");
		delete players[socket.client.id];
		socket.broadcast.emit("leave", socket.client.id);
	});

	socket.on("update", function(data) {
		socket.broadcast.emit("update", data);
	});
});

var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log(`Running on port ${port}...`);
});