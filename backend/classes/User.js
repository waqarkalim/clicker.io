class User {
  constructor(id, name, socket_id) {
    this.id = id;
    this.name = name;
    this.socket_id = socket_id;
    this.score = 0;
    this.timeRemaining = -1;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getSocketID() {
    return this.socket_id;
  }

  getScore() {
    return this.score;
  }

  setScore(score) {
    this.score = score;
  }

  incrementScore() {
    this.score = this.score + 1;
  }

  getTimeRemaining() {
    return this.timeRemaining;
  }

  setTimeRemaining(timeRemaining) {
    this.timeRemaining = timeRemaining;
  }
}

module.exports = User;
