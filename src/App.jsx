import { useState, useEffect } from 'react';
import Room from './components/Room';
import socket from './socket';
import './style.css';

function App() {
  const [loaded, setLoaded] = useState(false);
  const [connect, setConnect] = useState(false);

  useEffect(() => {
    const sessionID = localStorage.getItem('sessionID');

    if (sessionID) {
      socket.auth = { sessionID };
      socket.connect();
    } else {
      socket.connect();
    }

    socket.on('session', ({ sessionID, userID }) => {
      socket.auth = { sessionID };
      socket.userID = userID;
      localStorage.setItem('sessionID', sessionID);
      setLoaded(true);
      setConnect(true);
    });

    socket.on('connect_error', (err) => {
      console.log(err);
      setLoaded(true);
      setConnect(false);
    });

    return () => {
      socket.off('connect_error');
    };
  }, []);

  return (
    <div className="App">
      {loaded ? connect ? <Room /> : 'Сервер недоступен' : 'Загрузка...'}
    </div>
  );
}

export default App;
