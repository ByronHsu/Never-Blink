import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/styles';
import Divider from '@material-ui/core/Divider';
import { Line, Circle } from 'rc-progress';
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';
import green from '@material-ui/core/colors/green';
import Box from '@material-ui/core/Box';
import grey from '@material-ui/core/colors/grey';

const styles = () => ({
  root:{
    backgroundColor: '#f5f5f5',
    height: '100vh'
  },
  container:{
    padding: 2*8,
  },
  header:{
    textAlign: 'center',
    padding: 2*8,
  },
  timer:{
    backgroundColor: grey[900],
    color: grey[50],
    padding: 1*8
  },
  countdown:{
    color: red[500],
  },
  frameHeader:{
    // textAlign: 'center',
    padding: 2*8,
  },
  frame:{
    padding: 4*8,
    // textAlign: 'center'
  },
  footer:{
    textAlign: 'center'
  },
  video:{
    width: '100%',
    margin: 2*8
  }
});

class Play extends React.Component {
  constructor(props){
    super();
    this.props = props;
    this.callRef = React.createRef();
    this.recvRef = React.createRef();
    // function bind
    this.getScreenShot = this.getScreenShot.bind(this);
    this.state = {
      elapsed: 0,
      ear1: 0,
      ear2: 0,
      end: 0,
    }
    this.end = 0
    this.refreshIntervalId = ''
    this.color = [red[500], yellow[500], green[500]];
    console.log(this.color);
  }
  componentWillUnmount(){
    this.callClose()
  }
  componentDidMount(){
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    console.log('Play', 'didmount', this.recvRef)
    // Set up self media streaming (https://www.html5rocks.com/en/tutorials/getusermedia/intro/)
    if(navigator.getUserMedia){
      navigator.mediaDevices.getUserMedia({video: true}).
      then((stream) => {
        this.callRef.current.srcObject = stream;
        window.localStream = stream
      })
    }

    const {role, id, rival, peer, socket} = this.props
    //get arena data

    socket.on('get_arena_data', (data) => {
      // console.log(data);
      if(this.end == 1) return;
      let {ear1, ear2, elapsed, end} = data;
      let ear1_f = ear1.toFixed(2);
      let ear2_f = ear2.toFixed(2);
      let elapsed_f = elapsed.toFixed(0);
      console.log(data);
      console.log(this.end);
      if(end == 0){
        this.setState({
          ear1: ear1_f, ear2: ear2_f, elapsed: elapsed_f, end: end
        })
      }else{
        // ear1_f = (ear1 > ear2)? 'Win': 'Lose';
        // ear2_f = (ear2 > ear1)? 'Win': 'Lose';
        this.setState({
          ear1: ear1_f, ear2: ear2_f, elapsed: elapsed_f, end: end
        })
        this.end = end
        clearInterval(this.refreshIntervalId);
        console.log('end!')
      }
    })

    //answer
    if(role == 'recv'){
      peer.on('call', (call) => {
        call.answer(window.localStream); // Answer the call with an A/V stream.
        console.log('peer', 'on', this.recvRef)
        call.on('stream', (remoteStream) => {
            // Show stream in some <video> element.
            if(this.recvRef.current){
              this.recvRef.current.srcObject = remoteStream;
              socket.emit('set_player_startTime', {id: id});
              this.refreshIntervalId = setInterval(this.getScreenShot, 300);
            }
        });
      });
    }
    //call
    if(role == 'call'){
      const callRival = () => {
        const call = peer.call(rival, window.localStream);
        call.on('stream', (remoteStream) => {
            // console.log(remoteStream); 
            // Show stream in some <video> element.
            this.recvRef.current.srcObject = remoteStream;
            socket.emit('set_player_startTime', {id: id});
            this.refreshIntervalId = setInterval(this.getScreenShot, 300);
        });
      }
      // wait for the set up of recv side
      setTimeout(callRival, 3000)
    }
  }
  getScreenShot() {
    console.log('getScreenShot');
    const {id, socket} = this.props;
    // console.log('screenshot')
    const canvas = document.createElement('canvas');
    canvas.width = this.callRef.current.videoWidth;
    canvas.height = this.callRef.current.videoHeight;
    canvas.getContext('2d').drawImage(this.callRef.current, 0, 0);
    const data_uri = canvas.toDataURL('image/webp');
    // this.imageRef.current.src = data_uri;
    socket.emit('send_image', {uri: data_uri, id: id})
  }
  render(){
    const {classes} = this.props;
    let {ear1, ear2, elapsed, end} = this.state;
    let ear1_percent = (ear1 - 0.24) / (0.35 - 0.24) * 100
    let ear2_percent = (ear2 - 0.24) / (0.35 - 0.24) * 100
    if(ear1_percent < 0) ear1_percent = 0
    if(ear2_percent < 0) ear2_percent = 0
    const ear1_color = this.color[Math.round(ear1_percent / 33)]
    const ear2_color = this.color[Math.round(ear2_percent / 33)]
    console.log('ear1_percent', ear1_percent, 'ear2_percent', ear2_percent)
    let m, s, countdown;
    const elapsed_shift = elapsed - 3;
    let timer = null;
    if(elapsed_shift < 0){
      countdown = Math.round(-elapsed_shift)
      timer = (
        <Typography variant="h2" component="span" className={classes.countdown}>
        {countdown}
        </Typography>
      )
    }else{
      m = Math.round(elapsed_shift / 60).toString().padStart(2, '0'); 
      s = Math.round(Math.round(elapsed_shift) % 60).toString().padStart(2, '0');
      let message = ''
      if(end == 1){
        message = ear1 < ear2? 'WIN' : 'LOSE'
      }

      timer = (
        <Typography variant="h4" component="span" className={classes.timer}>
        {m}:{s} {message} 
        </Typography>
      )
    }
    return (
      <div className={classes.root}>
      <Grid container justify="space-around" spacing={3} className={classes.container}>
        <Grid item xs={12} className={classes.header}>
          {timer}
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.frame}>
          
          <Typography variant="h4">
          HP
          </Typography>
          
          <Line strokeWidth="2" trailWidth="2" strokeColor={ear1_color} percent={ear1_percent} />
          <Divider />
          <video className={classes.video} ref={this.callRef} autoPlay/>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.frame}>
          <Typography variant="h4">
          HP
          </Typography>
          <Line strokeWidth="2" trailWidth="2" strokeColor={ear2_color} percent={ear2_percent}/>
          <Divider />
          <video className={classes.video} ref={this.recvRef} autoPlay/>
          </Paper>
        </Grid>

        <Grid item xs={12} className={classes.footer}>
            {/*<Button variant="contained" color="primary" size="large" onClick={this.props.onClick}>
              Restart
          </Button>*/}
        </Grid>
      </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(Play);