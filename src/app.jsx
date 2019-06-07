/* eslint-disable no-console */
import React from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';
import uuidv4 from 'uuid/v4';
import Start from './start';
import Play from './play';

class App extends React.Component {
  constructor(props) {
    super();
    this.props = props;

    // Create client id.
    this.id = uuidv4();

    // Create peer and socket to communicate.
    this.peer = new Peer(this.id);
    this.socket = io(document.URL, { query: { id: this.id } });

    // Function bind.
    this.handleOnClick = this.handleOnClick.bind(this);
    this.onUnload = this.onUnload.bind(this);

    // Define state and other member variable.
    this.state = {
      isPlaying: 0,
      role: '',
      rivalId: '',
      connectToggle: false
    };
    this.rivalId = '';

    console.log('id', this.id);
  }

  componentDidMount() {
    console.log('app', 'componentDidMount');

    // FIXME: Flask-socketio 'disconnect' event can not be triggered immediately.
    //        Therefore, we use some trick to replace the 'disconnect' event.
    window.addEventListener('beforeunload', this.onUnload, false);

    /**
     * [For connect side]
     * After this client receive its rival's id from the server,
     * it will use 'peer' to inform its rival that the game is about to start.
     */
    this.socket.on('get_rival', data => {
      this.rivalId = data.id;
      const conn = this.peer.connect(this.rivalId);
      conn.on('open', () => {
        conn.send(this.id);
        console.log('connect side sends peer data');
      });
      this.setState({ isPlaying: 1, role: 'call', rivalId: this.rivalId });
    });

    /**
     * [For receiver side]
     * It will receive rival's id from connect side.
     */
    this.peer.on('connection', conn => {
      conn.on('data', data => {
        this.rivalId = data;
        console.log('receiver side receives peer data');
      });
      this.setState({ isPlaying: 1, role: 'recv', rivalId: this.rivalId });
    });
  }

  onUnload() {
    // Delete this client in server side.
    this.socket.emit('_disconnect', { id: this.id });
  }

  handleOnClick() {
    this.setState({ connectToggle: 1 });

    // Use 'settimeout' because we do not wish that the player connects to the other player too fast.
    setTimeout(() => {
      this.socket.emit('set_player_wait', { id: this.id });
    }, 1000);
  }

  render() {
    const { isPlaying, role, rivalId, connectToggle } = this.state;
    return (
      <React.Fragment>
        {isPlaying ? (
          <Play
            role={role}
            id={this.id}
            rival={rivalId}
            peer={this.peer}
            socket={this.socket}
          />
        ) : (
          <Start handleOnClick={this.handleOnClick} toggle={connectToggle} />
        )}
      </React.Fragment>
    );
  }
}

export default App;
