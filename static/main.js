var keyMap = Array(256);

var players = {};
var player;

var socket;

var windowWidth;
var windowHeight;

var align = function () {
	windowWidth = $(window).width();
	windowHeight = $(window).height();
	$("#canvas").attr("width", windowWidth)
		.attr("height", windowHeight);
};

var update = function () {
	player.update();
	for (var id in players) {
		players[id].update();
	}
	socket.emit("update", player.toJSON());
};

var render = function () {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, windowWidth, windowHeight);
	ctx.save();

	ctx.translate(windowWidth / 2, windowHeight / 2);
	ctx.scale(1, -1);

	// Draw other players first
	for (var id in players) {
		players[id].render(ctx);
	}

	// Draw your player last to it's on top
	player.render(ctx);

	ctx.restore();
};

var frame = function () {
	update();
	render();
	requestAnimationFrame(frame);
};

$(window).on("resize", align);

$(document).ready(function () {
	align();

	var keyPressed = function (e) {
		var code = (window.event) ? event.keyCode : e.keyCode;
		keyMap[code] = true;
	};

	var keyReleased = function (e) {
		var code = (window.event) ? event.keyCode : e.keyCode;
		keyMap[code] = false;
	};

	document.addEventListener('keydown', keyPressed, false);
	document.addEventListener('keyup', keyReleased, false);

	socket = io.connect(location.pathname);

	socket.on("update", function (data) {
		if (players[data.id]) {
			players[data.id].position = data.position;
			players[data.id].velocity = data.velocity;
		}
	});

	socket.on("join", function (data) {
		console.log("join", data);
		players[data.id] = new Player(data.color, data.position, [0, 0], data.id);
	});

	socket.on("leave", function (data) {
		delete players[data];
	});

	socket.on("init", function (data) {
		player = new Player(data.color, data.position, [0, 0], data.id);
		frame();
	});
})