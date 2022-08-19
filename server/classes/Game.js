class Game {
  #owner;
  #player;
  rounds = 1;
  score = { owner: 0, player: 0 };

  constructor(room, rounds) {
    this.#owner = room.owner;
    this.#player = room.player;
    this.rounds = rounds || this.rounds;
  }

  addPoint(userID) {
    if (userID === this.#owner) {
      this.score.owner++;
    } else if (userID === this.#player) {
      this.score.player++;
    } else {
      return false;
    }
    return true;
  }

  next() {
    if (this.rounds > 1) {
      this.rounds--;
      return true;
    } else if (this.rounds > 0) {
      this.rounds--;
      return false;
    }
    return false;
  }
}

exports.Game = Game;
