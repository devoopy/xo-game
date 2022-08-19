const { Game } = require('./Game');

class XOGame extends Game {
  #owner;
  #player;
  #length;
  #steps;
  grid;
  step;
  timeout = 10;

  constructor(room, rounds, length = 3) {
    super(room, rounds || length);
    this.#owner = room.owner;
    this.#player = room.player;
    this.#length = length;
    this.#steps = length * length;
    this.grid = XOGrid(length);
    this.step = this.whoseStep();
  }

  whoseStep() {
    if (this.#steps === 0) return null;
    if (this.rounds % 2 === this.#steps % 2) {
      return this.#owner;
    } else {
      return this.#player;
    }
  }

  get steps() {
    return this.#steps;
  }

  takeCell(cell, userID) {
    if (!cell) return false;
    cell = this.grid[cell.x]?.[cell.y];
    if (!cell || cell.taker) return false;
    cell.taker = userID === this.#owner ? 'owner' : 'player';
    return true;
  }

  resetRound() {
    this.#steps = this.#length ** 2;
    this.grid = XOGrid(this.#length);
    this.step = this.whoseStep();
  }

  freeCells() {
    const cells = [];
    this.grid.forEach((row) => {
      cells.push(...row.filter((cell) => !cell.taker));
    });
    return cells;
  }

  check() {
    const grid = this.grid;
    const winner =
      this.horizontal(grid) ||
      this.horizontal(grid, true) ||
      this.diagonal(grid) ||
      this.diagonal(grid, true);

    return winner;
  }

  diagonal(grid, mirror = false) {
    const line = [];

    for (let i = 0; i < grid.length; i++) {
      const j = grid[i].length - 1 - i;
      const cell = mirror ? grid[i][j] : grid[i][i];

      if (cell.taker && (i === 0 || cell.taker === line[i - 1].taker)) {
        line.push(cell);
      } else {
        return null;
      }
    }

    line.forEach((cell) => (cell.line = true));
    const userID = line[0].taker === 'owner' ? this.#owner : this.#player;
    return userID;
  }

  horizontal(grid, mirror = false) {
    for (let i = 0; i < grid.length; i++) {
      const line = [];
      const firstCell = mirror ? grid[0][i] : grid[i][0];

      if (firstCell.taker) {
        let isLine = true;
        line.push(firstCell);

        for (let j = 1; j < grid[i].length; j++) {
          const nextCell = mirror ? grid[j][i] : grid[i][j];
          if (firstCell.taker !== nextCell.taker) {
            isLine = false;
            break;
          }
          line.push(nextCell);
        }

        if (isLine) {
          line.forEach((cell) => (cell.line = true));
          const userID = line[0].taker === 'owner' ? this.#owner : this.#player;
          return userID;
        }
      }
    }
    return null;
  }

  nextStep() {
    if (this.#steps > 1) {
      this.#steps--;
      this.step = this.whoseStep();
      return true;
    } else if (this.#steps > 0) {
      this.#steps--;
      this.step = this.whoseStep();
      return false;
    }
    return false;
  }
}

function XOGrid(n, m = n) {
  const array = [];
  for (let i = 0; i < m; i++) {
    array[i] = [];
    for (let j = 0; j < n; j++) {
      array[i][j] = {
        x: i,
        y: j,
        taker: null,
      };
    }
  }
  return array;
}

exports.XOGame = XOGame;
