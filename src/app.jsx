import React from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';
import Start from './start';
import Play from './play';
import uuidv4 from 'uuid/v4';

class App extends React.Component {
    constructor(props) {
        super();
        this.props = props;
        this.id = uuidv4();
        this.rival_id = ''
        this.peer = new Peer(this.id); 
        this.socket = io(document.URL, {query: {id: this.id}});
        // function bind
        this.handleOnClick = this.handleOnClick.bind(this);
        this.handleStartOnClick = this.handleStartOnClick.bind(this);
        this.onUnload = this.onUnload.bind(this);
        this.state = {
          isPlaying: 0,
          role: '',
          rival_id: '',
          connectToggle: false
        }
        this.tmp = 0
        console.log('id', this.id)
    }

    componentDidMount() {
        console.log('componentDidMount')
        // delete this client in server before close page. 
        window.addEventListener('beforeunload', this.onUnload, false);
        // connect side
        this.socket.on('get_rival', (data) => {
            this.rival_id = data['id'];
            const conn = this.peer.connect(this.rival_id);
            conn.on('open', () => {
              conn.send(this.id);
              console.log('connect side sends peer data');
            });
            this.setState({isPlaying: 1, role: 'call', rival_id: this.rival_id});
        });
        // receiver side
        this.peer.on('connection', (conn) => {
          conn.on('data', (data) => {
            this.rival_id = data;
            console.log('receiver side receives peer data');
          });
          this.setState({isPlaying: 1, role: 'recv', rival_id: this.rival_id});
        });
    }

    onUnload() {
        this.socket.emit('_disconnect', {'id': this.id})
    }

    handleOnClick() {
        console.log('handleOnClick!');
        this.setState({connectToggle: 1});
        setTimeout(() => {
          this.socket.emit('set_player', {'id': this.id})
        }, 1000)

    }

    handleStartOnClick() {
        this.setState({isPlaying: 0});
    }

    render() {
      const {isPlaying, role, rival_id} = this.state;
      this.tmp += 1;
      return (
          <div>
          {
            isPlaying ? 
              (<Play role={role} id={this.id} rival={rival_id} peer={this.peer} socket={this.socket} onClick={this.handleStartOnClick} tmp={this.tmp}/>) :
              (<Start onClick={this.handleOnClick} toggle={this.state.connectToggle}/>)
          }
          </div>
      );
    }
}

export default App;