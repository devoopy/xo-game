import { useState, useEffect } from 'react';
import Game from './Game';
import socket from '../socket';

export default function Room() {
  const [gameBegun, setGameBegun] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    socket.on('new room', () => {
      setGameBegun(true);
      setWaiting(true);
    });

    socket.on('start', () => {
      setGameBegun(true);
      setWaiting(false);
    });

    return () => {
      socket.on('new room');
      socket.on('start');
    };
  }, []);

  function onJoin() {
    socket.emit('join');
  }

  function exit() {
    setGameBegun(false);
  }

  return (
    <div className="room">
      {gameBegun ? (
        <Game waiting={waiting} onExit={exit} />
      ) : (
        <button className="button" onClick={onJoin}>
          Play
        </button>
      )}
    </div>
  );
}
