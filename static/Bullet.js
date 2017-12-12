class Bullet {
    constructor(color, position, velocity, player) {
        this.color = color;
        this.position = position;
        this.velocity = velocity;
        this.size = 10;
        this.player = player;
        this.power = 1;
    }

    update(ctx) {
    	this.power = Math.max(this.power - 1 / 200, 0);
        this.position[0] += this.velocity[0];
        if (this.position[0] < LEFT_BOUND) {
            this.position[0] = 2 * LEFT_BOUND - this.position[0];
            this.velocity[0] *= -0.5;
        }
        if (this.position[0] > RIGHT_BOUND) {
            this.position[0] = 2 * RIGHT_BOUND - this.position[0];
            this.velocity[0] *= -0.5;
        }

        this.position[1] += this.velocity[1];
        if (this.position[1] < LOWER_BOUND) {
            this.position[1] = 2 * LOWER_BOUND - this.position[1];
            this.velocity[1] *= -0.5;
        }
        if (this.position[1] > UPPER_BOUND) {
            this.position[1] = 2 * UPPER_BOUND - this.position[1];
            this.velocity[1] *= -0.5;
        }
    }

    isAttacking(player) {
        if (this.position[0] < player.position[0] + player.size / 2 &&
            this.position[0] > player.position[0] - player.size / 2 &&
            this.position[1] < player.position[1] + player.size / 2 &&
            this.position[1] > player.position[1] - player.size / 2) {
            return true;
        }
        return false;
    }

    render(ctx) {
    	ctx.globalAlpha = this.power;
    	ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position[0], this.position[1], this.size / 2, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }
}