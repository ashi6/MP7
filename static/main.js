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
	
	socket.emit("update", player.position);
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
	ctx.fillStyle = player.color;
	ctx.fillRect(player.position[0] - 50, player.position[1] - 50, 100, 100);

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
		players[data.id].position = data;
	});

	socket.on("join", function (data) {
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