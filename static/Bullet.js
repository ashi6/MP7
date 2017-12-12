class Bullet {
    constructor(color, position, velocity, id) {
        this.color = color;
        this.position = position;
        this.velocity = velocity;
        this.size = 5;
        this.id = id;
    }
    update(ctx) {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
    }
    isAttacking(player2) {
        if (this.position[0] < player2.position[0] + player2.size / 2 &&
            this.position[0] > player2.position[0] - player2.size / 2 &&
            this.position[1] < player2.position[1] + player2.size / 2 &&
            this.position[1] > player2.position[1] - player2.size / 2) {
            player2.health -= 10;
            return true;
        }
        return false;
    }

}