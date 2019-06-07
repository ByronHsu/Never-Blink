/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-console */
import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import { Line } from 'rc-progress';
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';
import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';

const styles = theme => ({
  root: {
    backgroundColor: grey[100],
    height: '100vh'
  },
  container: {
    padding: theme.spacing(2)
  },
  header: {
    textAlign: 'center',
    padding: theme.spacing(2)
  },
  timer: {
    backgroundColor: grey[800],
    color: grey[50],
    padding: theme.spacing(1)
  },
  countdown: {
    color: red[500]
  },
  frameHeader: {
    padding: theme.spacing(2)
  },
  frame: {
    padding: theme.spacing(4)
  },
  footer: {
    textAlign: 'center'
  },
  video: {
    width: '100%',
    margin: theme.spacing(2)
  }
});

// Utils function
const normalize = x => {
  const threshold = 0.24;
  const upper = 0.35;
  const result = ((x - threshold) / (upper - threshold)) * 100;
  if (result < 0) return 0;
  return result;
};
class Play extends React.Component {
  constructor(props) {
    super();
    this.props = props;
    this.callRef = React.createRef();
    this.recvRef = React.createRef();

    // Function bind.
    this.getScreenShot = this.getScreenShot.bind(this);

    // Define state and varible.
    this.state = {
      elapsed: 0, // The time passed from start.
      EAR1: 0, // Player's eye aspect ratio.
      EAR2: 0, // Rival's eye aspect ratio.
      end: 0, // Whether the game has ended.
      uri1: '', // Store the blinking image frame.
      uri2: '' // Store the blinking image frame.
    };
    this.end = 0; // Synchornous version of 'this.state.end'
    this.refreshIntervalId = '';
    this.progressColor = [red[500], yellow[500], green[500]]; // Different stage's color for the progress bar.
  }

  componentDidMount() {
    console.log('Play', 'componentdidmount');

    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    // Set up self media streaming (https://www.html5rocks.com/en/tutorials/getusermedia/intro/)
    if (navigator.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.callRef.current.srcObject = stream;
        window.localStream = stream;
      });
    }

    const { role, id, rival, peer, socket } = this.props;

    /**
     * [Get arena data]
     * Receive data from the server side.
     */
    socket.on('get_arena_data', data => {
      // Use sync version of 'end' to determine whether to receive new data.
      if (this.end === 1) return;
      console.log('get_arena_data', data);
      const { EAR1, EAR2, elapsed, end, uri1, uri2 } = data;
      this.setState({
        EAR1,
        EAR2,
        elapsed,
        end,
        uri1,
        uri2
      });
      if (end === 1) {
        // Set sync version of 'end' because 'this.state.end' will have a delay.
        this.end = end;
        // Stop sending screenshots to server.
        clearInterval(this.refreshIntervalId);
      }
    });

    const sendRate = 300; // send every 300 ms
    /**
     * [Media stream, receiver side]
     * https://github.com/peers/peerjs
     */
    if (role === 'recv') {
      peer.on('call', call => {
        call.answer(window.localStream);

        call.on('stream', remoteStream => {
          if (this.recvRef.current) {
            this.recvRef.current.srcObject = remoteStream;
            socket.emit('set_player_startTime', { id });
            this.refreshIntervalId = setInterval(this.getScreenShot, sendRate);
          }
        });
      });
    }

    /**
     * [Media stream, caller side]
     * https://github.com/peers/peerjs
     */
    if (role === 'call') {
      const callRival = () => {
        const call = peer.call(rival, window.localStream);
        call.on('stream', remoteStream => {
          this.recvRef.current.srcObject = remoteStream;
          socket.emit('set_player_startTime', { id });
          this.refreshIntervalId = setInterval(this.getScreenShot, sendRate);
        });
      };

      const setupTime = 3000; // 3000 ms

      // Wait for the set up of recv side.
      setTimeout(callRival, setupTime);
    }
  }

  getScreenShot() {
    /**
     * Capture screenshot image from '<video>' and then send to the server at a certain frequency.
     */
    console.log('Play', 'getScreenShot');
    const { id, socket } = this.props;
    const canvas = document.createElement('canvas');
    canvas.width = this.callRef.current.videoWidth;
    canvas.height = this.callRef.current.videoHeight;
    canvas.getContext('2d').drawImage(this.callRef.current, 0, 0);

    const dataUri = canvas.toDataURL('image/webp');
    socket.emit('send_image', { uri: dataUri, id });
  }

  render() {
    const { classes } = this.props;
    const { EAR1, EAR2, elapsed, end, uri1, uri2 } = this.state;

    // Calculate EAR percent and progress bar color
    const ear1Percent = normalize(EAR1);
    const ear2Percent = normalize(EAR2);
    const ear1Color = this.progressColor[Math.round(ear1Percent / 33)];
    const ear2Color = this.progressColor[Math.round(ear2Percent / 33)];
    console.log('ear1Percent', ear1Percent, 'ear2Percent', ear2Percent);

    // Calculate timer
    // The game starts after 3 second of countdown.
    const prepareTime = 3;

    const counter = elapsed - prepareTime;
    const min = Math.round(counter / 60)
      .toString()
      .padStart(2, '0');
    const sec = Math.round(Math.round(counter) % 60)
      .toString()
      .padStart(2, '0');
    let message = '';
    if (counter < 0) {
      // countdown
      message = Math.round(-counter);
    } else {
      // start timer
      message = `${min} : ${sec}`;
      if (end === 1) {
        if (EAR1 > EAR2) message += ' WIN';
        else message += ' LOSE';
      }
    }

    return (
      <div className={classes.root}>
        <Grid
          container
          justify="space-around"
          spacing={3}
          className={classes.container}
        >
          <Grid item xs={12} className={classes.header}>
            <Typography variant="h4" component="span" className={classes.timer}>
              {message}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.frame}>
              <Typography variant="h4">HP</Typography>

              <Line
                strokeWidth="2"
                trailWidth="2"
                strokeColor={ear1Color}
                percent={ear1Percent}
              />
              <Divider />
              {end ? (
                <img src={uri1} alt="Can not access" />
              ) : (
                <video className={classes.video} ref={this.callRef} autoPlay />
              )}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.frame}>
              <Typography variant="h4">HP</Typography>
              <Line
                strokeWidth="2"
                trailWidth="2"
                strokeColor={ear2Color}
                percent={ear2Percent}
              />
              <Divider />
              {end ? (
                <img src={uri2} alt="Can not access" />
              ) : (
                <video className={classes.video} ref={this.recvRef} autoPlay />
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} className={classes.footer}></Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Play);
