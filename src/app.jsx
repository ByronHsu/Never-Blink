import React from 'react';
import ReactDOM from 'react-dom';
import Camera from './camera';
import Peer from 'peerjs';
import io from 'socket.io-client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';
import { ThemeProvider } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Start from './start';
import Play from './play';
import uuidv4 from 'uuid/v4';

const styles = () => ({
    root: {
      // JSS uses px as the default units for this CSS property.
      height: '100vh',
      backgroundColor: '#f5f5f5'
    },
    item: {
      padding: 8 * 2,
      textAlign: 'center'
    }
});

class App extends React.Component {
    constructor(props) {
        super();
        this.props = props;
        this.id = uuidv4();
        this.peer = new Peer(this.id); 
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOnClick = this.handleOnClick.bind(this);
        this.onUnload = this.onUnload.bind(this);

        this.state = {value: '', id_list: []};
        this.socket = io(document.URL, {query: {id: this.id}});
        this.revRef = React.createRef();
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
    handleOnClick() {
        console.log('handleOnClick!')
        this.socket.emit('set_player', {'id': this.id})
    }
    render() {
        const { classes } = this.props;
        return (
            <div>
                <Start onClick={this.handleOnClick}/>
                {/*
                <Grid container justify="center" alignItems="center" className={classes.root}>
                    <Grid item>
                        <Paper className={classes.item}>
                        <Typography variant="h5" component="h3">
                            Blink Contest
                        </Typography>
                        <Typography component="p">
                            Challenge all the players around the world.
                        </Typography>
                        <Button variant="outlined" color="primary" className={classes.button}>
                            Connect
                        </Button> 
                        </Paper>
                    </Grid>
                </Grid>
                

                {this.id}
                <div>My Flask React App !</div>
                <Camera socket={this.socket}></Camera>
                <input type="text" value={this.state.value} onChange={this.handleChange} />
                <button onClick={this.handleSubmit}> click!</button>
                other
                <video ref={this.revRef} autoPlay> </video>
                {this.state.id_list.map((item, i) => (<li key={i}> {item} </li>))}
                */}
            </div>
        );
    }
}

export default withStyles(styles)(App);