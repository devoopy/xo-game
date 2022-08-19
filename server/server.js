const { InMemorySessionStore } = require('./classes/sessionStore');
const { Room } = require('./classes/Room');
const { XOGame } = require('./classes/XOGame');
const { random } = require('./utils');

const crypto = require('crypto');
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

const sessionStore = new InMemorySessionStore();
const randomId = () => crypto.randomBytes(8).toString('hex');

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;

  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      return next();
    }
  }

  socket.sessionID = randomId();
  socket.userID = randomId();
  next();
});

io.on('connection', (socket) => {
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
  });

  socket.emit('session', {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.join(socket.userID);

  socket.on('join', () => {
    const room = Room.find(socket.userID);
    const freeRoom = Room.free;

    if (room) {
      socket.join(room.name);
      socket.emit('start');
      socket.emit('round', room.game);
    } else if (freeRoom) {
      freeRoom.player = socket.userID;
      socket.join(freeRoom.name);
      io.in(freeRoom.name).emit('start');
      startGame(freeRoom);
    } else {
      const room = new Room(socket.userID);
      socket.join(room.name);
      socket.emit('new room');
    }
  });

  socket.on('take', (cell) => {
    takeCell(socket.userID, cell);
  });

  socket.on('disconnect', async () => {
    const room = Room.find(socket.userID);
    if (!room) return;

    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      io.in(room.name).emit('leave', socket.userID);
    }

    const roomSockets = await io.in(room.name).allSockets();
    const isEmptyRoom = roomSockets.size === 0;
    if (isEmptyRoom) {
      clearTimeout(room.game.autostep);
      Room.delete(room.owner);
    }
  });

  const ROUND_DELAY = 3;

  function startGame(room) {
    room.startGame(XOGame);
    io.in(room.name).emit('timer', ROUND_DELAY);
    setTimeout(() => {
      io.in(room.name).emit('round', room.game);
      autoStep(room);
    }, ROUND_DELAY * 1e3);
  }

  function gameStep(room) {
    const step = room.game.nextStep();
    const winner = room.game.check();
    if (winner || !step) {
      room.game.addPoint(winner);
      room.game.step = null;
      io.in(room.name).emit('point', room.game);
      setTimeout(() => gameRound(room), ROUND_DELAY * 1e3);
    } else {
      io.in(room.name).emit('round', room.game);
      autoStep(room);
    }
  }

  function gameRound(room) {
    const next = room.game.next();
    if (next) {
      room.game.resetRound();
      io.in(room.name).emit('round', room.game);
      autoStep(room);
    } else {
      room.game.win =
        room.game.score.owner > room.game.score.player
          ? room.owner
          : room.player;

      io.in(room.name).emit('game over', room.game);
      io.socketsLeave(room.name);
      Room.delete(room.owner);
    }
  }

  function autoStep(room) {
    const rounds = room.game.rounds;
    const steps = room.game.steps;
    room.game.autostep = setTimeout(() => {
      if (rounds === room.game.rounds && steps === room.game.steps) {
        autoTake(room);
      }
    }, room.game.timeout * 1e3);
  }

  function autoTake(room) {
    const cells = room.game.freeCells();
    const index = random(0, cells.length - 1);
    const cell = cells[index];
    takeCell(room.game.step, cell);
  }

  function takeCell(userID, cell) {
    const room = Room.find(userID);
    if (!room) return;
    if (room.game.step !== userID) return;

    const take = room.game.takeCell(cell, userID);
    if (take) {
      clearTimeout(room.game.autostep);
      gameStep(room);
    }
  }
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () =>
  console.log(`Server listening at http://localhost:${PORT}`)
);
