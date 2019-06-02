import React from 'react';
import ReactDOM from 'react-dom';
import Camera from './camera';
import axios from 'axios';
import Peer from 'peerjs';
import io from 'socket.io-client';
class App extends React.Component {
    constructor() {
        super();
        this.id = `${Date.now()}`;
        this.peer = new Peer(this.id); 
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onUnload = this.onUnload.bind(this);

        this.state = {value: '', id_list: []}
        this.revRef = React.createRef();
        this.socket = io(document.URL, {query: {id: this.id}})
        console.log('id', this.id);
    }

    componentDidMount() {
        console.log('componentDidMount')
        // delete this client in server before close page. 
        window.addEventListener('beforeunload', this.onUnload, false);
        // dymanically update id_list

        // answer
        this.peer.on('call', (call) => {
            call.answer(window.localStream); // Answer the call with an A/V stream.
            call.on('stream', (remoteStream) => {
                // Show stream in some <video> element.
                this.revRef.current.srcObject = remoteStream;
            });
        })
        this.socket.on('get_id_list', (data) => {
            this.setState({
                id_list: data.id_list
            })
        })
    }

    onUnload() {
        this.socket.emit('_disconnect', {'id': this.id})
    }

    handleSubmit(event) {
        // call
        const call = this.peer.call(this.state.value, window.localStream);
        call.on('stream', (remoteStream) => {
            // Show stream in some <video> element.
            this.revRef.current.srcObject = remoteStream;
        });
        event.preventDefault();
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }  
    render() {
        return (
            <div>
                {this.id}
                <div>My Flask React App !</div>
                <Camera socket={this.socket}></Camera>
                <input type="text" value={this.state.value} onChange={this.handleChange} />
                <button onClick={this.handleSubmit}> click!</button>
                other
                <video ref={this.revRef} autoPlay> </video>
                {this.state.id_list.map((item, i) => (<li key={i}> {item} </li>))}
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
