import React from 'react';
import ReactDOM from 'react-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/styles';

const styles = () => ({
  root: {
    backgroundColor: '#f5f5f5'
  },
  paper: {
    padding: 8 * 2,
  },
  video: {
    width: '100%'
  }
});
class Camera extends React.Component {
    constructor(props) {
        super(props);
        // Dom reference
        this.props = props;
        this.videoRef = React.createRef();
        this.videoRef2 = React.createRef();
        this.imageRef = React.createRef();
        this.getScreenShot = this.getScreenShot.bind(this);
        this.state = {ear: 0}
        this.pause = false
    }
    componentDidMount() {
        navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

        // Set up media streaming (https://www.html5rocks.com/en/tutorials/getusermedia/intro/)
        // if(navigator.getUserMedia){
        console.log(navigator)
        navigator.mediaDevices.getUserMedia({video: true}).
        then((stream) => {
          this.videoRef.current.srcObject = stream;
          this.videoRef2.current.srcObject = stream;
          window.localStream = stream
        }).
        then(()=>{setInterval(this.getScreenShot, 300)})
        // }

        this.props.socket.on('get_ear', (data) => {
            this.setState({ear: data.ear})
            console.log('ear', data.ear)
            console.log('delay', Date.now() - data.time)
            // if(data.ear < 0.27){
            //     alert('blink')
            // }
        })
    }
    getScreenShot() {
        // console.log('screenshot')
        const canvas = document.createElement('canvas');
        canvas.width = this.videoRef.current.videoWidth;
        canvas.height = this.videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(this.videoRef.current, 0, 0);
        const data_uri = canvas.toDataURL('image/webp');
        // this.imageRef.current.src = data_uri;
        this.props.socket.emit('send_image', {uri: data_uri, time: Date.now()})
    }
    render() {
        const { classes } = this.props;
        return (
            <Grid container spacing={3} className={classes.root}>
                <Grid item xs={6}>
                  <Paper className={classes.paper}>
                  <video ref={this.videoRef} autoPlay className={classes.video}></video>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper className={classes.paper}>
                  <video ref={this.videoRef2} autoPlay className={classes.video}></video>
                  </Paper>
                </Grid>
                <button onClick={this.getScreenShot}>screenshot</button>
                {/*<img ref={this.imageRef}></img>*/} 
                {this.state.ear}
            </Grid>
        );
    }
}

export default withStyles(styles)(Camera);