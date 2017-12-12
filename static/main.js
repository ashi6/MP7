// Map of keycodes to whether corresponding key is up
var keyMap = Array(256);

// Mouse position relative to center (location of player)
var mouseX = 0;
var mouseY = 0;

// Object associating ids with the other connected players
var players = {};

// The client's player
var player;

// socket.io socket
var socket;

// width and height of the page, and also the canvas
var windowWidth;
var windowHeight;

const TILE_SIZE = 500;

const LEFT_BOUND = 4 * -TILE_SIZE + 22;
const RIGHT_BOUND = 4 * TILE_SIZE - 32;
const LOWER_BOUND = 6 * -TILE_SIZE + 22;
const UPPER_BOUND = 6 * TILE_SIZE - 32;

// Resizes the canvas so it fills the page
var align = function() {
    windowWidth = $(window).width();
    windowHeight = $(window).height();
    $("#canvas").attr("width", windowWidth)
        .attr("height", windowHeight);
};

// Called every frame to update information
var update = function() {
    player.update();
    player.updateKeys();
    for (var id in players) {
        players[id].update();
    }
    socket.emit("update", player.toJSON());

    $("#status").html(`${player.position[0]}, ${player.position[1]}`);
};

// Called every frame to draw everything
var render = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, windowWidth, windowHeight);
    ctx.save();

    ctx.strokeStyle = '#DDD';

    ctx.lineWidth = 5;

    ctx.translate(windowWidth / 2, windowHeight / 2);
    ctx.scale(1, -1);

    // Draw vertical grid lines
    for (var x = -player.position[0] % TILE_SIZE - 2 * TILE_SIZE - ctx.lineWidth; x < windowWidth + ctx.lineWidth; x += TILE_SIZE) {
    	ctx.beginPath();
    	ctx.moveTo(x, -windowHeight / 2);
    	ctx.lineTo(x, windowHeight / 2);
    	ctx.stroke();
    }

	// Draw horizontal grid lines
    for (var y = -player.position[1] % TILE_SIZE - TILE_SIZE - ctx.lineWidth; y < windowHeight + ctx.lineWidth; y += TILE_SIZE) {
    	ctx.beginPath();
    	ctx.moveTo(-windowWidth / 2, y);
    	ctx.lineTo(windowWidth / 2, y);
    	ctx.stroke();
    }

    ctx.translate(-player.position[0], -player.position[1]);

    // Draw other players first
    for (var id in players) {
        players[id].render(ctx);
    }

    // Draw your player last to it's on top
    player.render(ctx);

    ctx.restore();
};

var frame = function() {
    update();
    render();
    requestAnimationFrame(frame);
};

$(window).on("resize", align);

$(document).ready(function() {
    align();

    // Key listeners
    var keyPressed = function(e) {
        var code = (window.event) ? event.keyCode : e.keyCode;
        keyMap[code] = true;
    };

    var keyReleased = function(e) {
        var code = (window.event) ? event.keyCode : e.keyCode;
        keyMap[code] = false;
    };

    document.addEventListener('keydown', keyPressed, false);
    document.addEventListener('keyup', keyReleased, false);

    // Mouse listener
    var captureMouseLocation = function(e) {
        var playerPos = player == undefined ? [0, 0] : player.position;
        mouseX = e.pageX - windowWidth / 2;
        mouseY = windowHeight / 2 - e.pageY;
    };

    document.addEventListener("mousemove", captureMouseLocation, false);

    socket = io.connect(location.pathname);

    socket.on("update", function(data) {
        if (players[data.id]) {
            players[data.id].position = data.position;
            players[data.id].velocity = data.velocity;
        }
    });

    socket.on("join", function(data) {
        console.log("join", data);
        players[data.id] = new Player(data.color, data.position, [0, 0], data.id);
    });

    socket.on("leave", function(data) {
        delete players[data];
    });

    socket.on("init", function(data) {
        player = new Player(data.color, data.position, [0, 0], data.id);
        frame();
    });
})