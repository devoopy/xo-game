import { useState, useEffect } from 'react';
import Grid from './Grid';
import socket from '../socket';

export default function Game({ waiting, onExit }) {
  const [game, setGame] = useState(null);
  const [timer, setTimer] = useState(null);
  const [stepTimer, setStepTimer] = useState(null);
  const [owner] = useState(waiting ? true : false);

  useEffect(() => {
    socket.on('timer', (time) => {
      setTimer(time);
    });

    socket.on('round', (game) => {
      setGame(game);
      setStepTimer(game.timeout);
    });

    socket.on('point', (game) => {
      setGame(game);
    });

    socket.on('game over', (game) => {
      setGame(game);
    });

    socket.on('leave', (userID) => {
      console.log(`${userID} has left the game`);
    });

    return () => {
      socket.off('timer');
      socket.off('round');
      socket.off('point');
      socket.off('game over');
      socket.off('leave');
    };
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer(timer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (stepTimer <= 0) return;

    const interval = setInterval(() => {
      setStepTimer(stepTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [stepTimer]);

  function takeCell(cell) {
    socket.emit('take', cell);
  }

  function exitClick() {
    onExit();
  }

  return (
    <div className="game">
      {game ? (
        <>
          <div className={`score ${owner}`}>
            <span>{game.score.owner}</span>
            <span>{game.score.player}</span>
          </div>
          {game.rounds ? (
            <>
              <div className="step">
                {game.step &&
                  (game.step === socket.userID
                    ? `Ваш ход ${stepTimer}`
                    : 'Ход соперника')}
              </div>
              <Grid grid={game.grid} takeCell={takeCell} />
            </>
          ) : (
            <>
              Игра закончена
              <button className="button" onClick={exitClick}>
                Выйти
              </button>
            </>
          )}
        </>
      ) : waiting ? (
        'Ожидание игрока...'
      ) : (
        'Начало игры ' + timer
      )}
    </div>
  );
}
