const { Game } = require('./Game');

class Room {
  static #rooms = [];
  #game;
  name;
  owner;
  player;

  constructor(owner) {
    this.name = owner + 'r';
    this.owner = owner;
    Room.#rooms.push(this);
  }

  static get free() {
    return this.#rooms.find((room) => !room.player);
  }

  get game() {
    return this.#game;
  }

  static find(userID) {
    return this.#rooms.find(
      (room) => userID === room.owner || userID === room.player
    );
  }

  static delete(owner) {
    this.#rooms = this.#rooms.filter((room) => room.owner !== owner);
  }

  startGame(GameClass = Game, rounds) {
    this.#game = new GameClass(this, rounds);
  }
}

exports.Room = Room;
