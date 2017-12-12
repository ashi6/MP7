const MAX_SPEED = 10;

class Player {
    constructor(color, position, velocity, id) {
        this.color = color;
        this.position = position;
        this.velocity = velocity;
        this.size = 50;
        this.id = id;
        this.health = 100;
        this.damageAlpha = 0;
    }

    isAttacking(player2) {
        if (this.position[0] < player2.position[0] + player2.size / 2 && this.position[0] > player2.position[0] - player2.size / 2) {
            if (this.position[1] < player2.position[1] + player2.size / 2 && this.position[1] > player2.position[1] - player2.size / 2) {
                this.health -= 20;
                player2.health -= 20;
                return true;
            }
        }
        return false;
    }

    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
        this.damageAlpha = 1;
    };

    updateKeys() {
        // accelerate depending on keys pressed
        if (keyMap[87] || keyMap[38]) { // W or up arrow key
            this.accelerate(0, 0.4);
        }
        if (keyMap[65] || keyMap[37]) { // A or left arrow key
            this.accelerate(-0.4, 0);
        }
        if (keyMap[83] || keyMap[40]) { // S or down arrow key
            this.accelerate(0, -0.4);
        }
        if (keyMap[68] || keyMap[39]) { // D or right arrow key
            this.accelerate(0.4, 0);
        }
    }

    update() {
        // update position
        this.position[0] += this.velocity[0];
        if (this.position[0] - this.size / 2 < LEFT_BOUND) {
            this.position[0] = LEFT_BOUND + this.size / 2;
            this.velocity[0] *= -0.5;
        }
        if (this.position[0] + this.size / 2 > RIGHT_BOUND) {
            this.position[0] = RIGHT_BOUND - this.size / 2;
            this.velocity[0] *= -0.5;
        }

        this.position[1] += this.velocity[1];
        if (this.position[1] - this.size / 2 < LOWER_BOUND) {
            this.position[1] = LOWER_BOUND + this.size / 2;
            this.velocity[1] *= -0.5;
        }
        if (this.position[1] + this.size / 2 > UPPER_BOUND) {
            this.position[1] = UPPER_BOUND - this.size / 2;
            this.velocity[1] *= -0.5;
        }

        // simulate friction
        this.velocity[0] *= 0.98;
        this.velocity[1] *= 0.98;

        // update red flash on damage
        this.damageAlpha = Math.max(this.damageAlpha - 0.1, 0);
    }

    accelerate(dx, dy) {
        this.velocity[0] += dx;
        this.velocity[1] += dy;
        let m = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[1] * this.velocity[1]);
        if (m > MAX_SPEED) {
            this.velocity[0] *= MAX_SPEED / m;
            this.velocity[1] *= MAX_SPEED / m;
        }
    }

    render(ctx) {
        if (this.health <= 0) return;
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position[0] - this.size / 2, this.position[1] - this.size / 2, this.size, this.size);
        ctx.strokeRect(this.position[0] - this.size / 2, this.position[1] - this.size / 2, this.size, this.size);
        ctx.fillStyle = "#F00";
        ctx.globalAlpha = this.damageAlpha;
        ctx.fillRect(this.position[0] - this.size / 2, this.position[1] - this.size / 2, this.size, this.size);
    }

    toJSON() {
        return {
            color: this.color,
            position: this.position,
            velocity: this.velocity,
            id: this.id,
            health: this.id
        }
    }
}