class Player {
    constructor(color, position, velocity) {
        this.color = color;
        this.position = position;
        this.velocity = velocity;
    }
    isAttacking(player2) {
        if(this.position == player2.position) {
            return true;
        } else {
            return false;
        }
    }
    compareSpeed(player2) {
        return this.velocity - player2.velocity
    }
}
