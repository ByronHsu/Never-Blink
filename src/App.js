import React from 'react';
import Webcam from './Webcam.js'
import './App.css';

const io = require('socket.io-client')('http://localhost:5000')

function App() {
  return (
    <div className="App">
      <Webcam socket={io}></Webcam>
    </div>
  );
}

export default App;
