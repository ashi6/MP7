const MAX_SPEED = 4;

class Player {
	constructor (color, position, velocity, id) {
		this.color = color;
		this.position = position;
		this.velocity = velocity;
		this.size = 50;
		this.id = id;
	}

	isAttacking (player2) {
		return this.position == player2.position;
	}

	compareSpeed (player2) {
		return this.velocity - player2.velocity
	}

	update (ctx) {
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];
		if (keyMap[87] || keyMap[38]) { // W or up arrow key
			this.accelerate(0, 0.25);
		}
		if (keyMap[65] || keyMap[37]) { // A or left arrow key
			this.accelerate(-0.25, 0);
		}
		if (keyMap[83] || keyMap[40]) { // S or down arrow key
			this.accelerate(0, -0.25);
		}
		if (keyMap[68] || keyMap[39]) { // D or right arrow key
			this.accelerate(0.25, 0);
		}
	}

	accelerate (dx, dy) {
		this.velocity[0] += dx;
		this.velocity[1] += dy;
		let m = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[1] * this.velocity[1]);
		if (m > MAX_SPEED) {
			this.velocity[0] *= MAX_SPEED / m;
			this.velocity[1] *= MAX_SPEED / m;
		}
	}

	render (ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.position[0] - this.size / 2, this.position[1] - this.size / 2, this.size, this.size);
	}

	toJSON () {
		return {
			color: this.color,
			position: this.position,
			velocity: this.velocity,
			id: this.id
		}
	}
}