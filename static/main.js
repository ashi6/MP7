// Map of keycodes to whether corresponding key is up
var keyMap = Array(256);

// Mouse position relative to center (location of player)
var mouseX = 0;
var mouseY = 0;

// Object associating ids with the other connected players
var players = {};

// The client's player
var player;

// bullet stuff
var bullets = {};
var canFire = true;

// for misc stats
var stats = {
    totalDamage: 0,
    totalHits: 0,
    shotsFired: 0,
    kills: 0
};

// socket.io socket
var socket;

// width and height of the page, and also the canvas
var windowWidth;
var windowHeight;

const TILE_SIZE = 500;

const LEFT_BOUND = 4 * -TILE_SIZE - 1;
const RIGHT_BOUND = 4 * TILE_SIZE - 9;
const LOWER_BOUND = 6 * -TILE_SIZE - 1;
const UPPER_BOUND = 6 * TILE_SIZE - 9;

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
    for (let id in players) {
        players[id].update();
    }
    socket.emit("update", player.toJSON());

    for (let id in bullets) {
        let bullet = bullets[id];
        let damage = Math.round(bullet.power * 10);
        bullet.update();
        if (player.health > 0 && bullet.player.id != player.id && bullet.isAttacking(player)) {
            socket.emit("hit", {
                player: player.id,
                id: id,
                damage: damage
            });
            player.takeDamage(damage);
            bullet.power = 0;
        }
        if (bullet.power <= 0) delete bullets[id];
    }

    if (keyMap[32] && player.health > 0 && canFire) {
        canFire = false;
        let id = stats.shotsFired;
        let m = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        socket.emit("bullet", {
            player: player.id,
            velocity: [20 * mouseX / m + player.velocity[0], 20 * mouseY / m + player.velocity[1]],
            id: id
        });
        stats.shotsFired++;
        bullets[player.id + id] = new Bullet(player.color, [...player.position], [20 * mouseX / m + player.velocity[0], 20 * mouseY / m + player.velocity[1]], player);
        setTimeout(() => { canFire = true; }, 300);
    }

    $("#status").html(`position: ${player.position[0].toFixed(0)}, ${player.position[1].toFixed(0)}<br>
    	shots fired: ${stats.shotsFired}<br>
    	total hits: ${stats.totalHits}<br>
    	damage dealt: ${stats.totalDamage}`);

    if (keyMap[9]) {
        $("#status").css("margin-left", "10px");
    } else {
        $("#status").css("margin-left", "-250px");
    }
};

// Called every frame to draw everything
var render = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, windowWidth, windowHeight);
    ctx.save();

    ctx.strokeStyle = "#DDD";
    ctx.lineWidth = 5;
    ctx.globalAlpha = 1;

    ctx.translate(windowWidth / 2, windowHeight / 2);
    ctx.scale(1, -1);

    // Draw vertical grid lines
    for (let x = -player.position[0] % TILE_SIZE - 2 * TILE_SIZE - ctx.lineWidth; x < windowWidth + ctx.lineWidth; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, -windowHeight / 2);
        ctx.lineTo(x, windowHeight / 2);
        ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = -player.position[1] % TILE_SIZE - TILE_SIZE - ctx.lineWidth; y < windowHeight + ctx.lineWidth; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(-windowWidth / 2, y);
        ctx.lineTo(windowWidth / 2, y);
        ctx.stroke();
    }

    ctx.translate(-player.position[0], -player.position[1]);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    // Draw bullets
    for (let id in bullets) {
        bullets[id].render(ctx);
    }

    ctx.globalAlpha = 1;

    // Draw other players before yours
    for (let id in players) {
        players[id].render(ctx);
    }

    // Draw your player last to it's on top
    player.render(ctx);

    ctx.restore();

    // Draw health bar
    ctx.fillStyle = `rgb(${255 - 255 * player.health / 100}, ${255 * player.health / 100}, 0)`;
    ctx.fillRect(10, 10, windowWidth / 300 * player.health, 25);
    ctx.strokeRect(10, 10, windowWidth / 300 * player.health, 25);
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
        if (e.keyCode == 9) e.preventDefault();
    };

    var keyReleased = function(e) {
        var code = (window.event) ? event.keyCode : e.keyCode;
        keyMap[code] = false;
    };

    document.addEventListener("keydown", keyPressed, false);
    document.addEventListener("keyup", keyReleased, false);

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

    socket.on("bullet", function(data) {
        let player = players[data.player];
        if (player) {
            bullets[data.player + data.id] = new Bullet(player.color, [...player.position], data.velocity, player);
        }
    });

    socket.on("hit", function(data) {
        players[data.player].takeDamage(data.damage);
        if (bullets[data.id].player.id != player.id && players[data.player].health <= 0) {
        	console.log(bullets[data.id].player.id + " killed " + data.player);
        	// Add to ill feed
        } else {
        	console.log(bullets[data.id].player.id + " hit " + data.player);
        }
        if (bullets[data.id].player.id == player.id) {
            stats.totalHits++;
            stats.totalDamage += data.damage;
            if (players[data.player].health <= 0) {
            	stats.kills++;
            	console.log("You killed " + data.player);
            	// Add to kill feed, notify kill
            } else {
            	// You hit someone!
            }
        }
        delete bullets[data.id];
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
});