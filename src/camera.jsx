import React from 'react';
import ReactDOM from 'react-dom';

export default class Camera extends React.Component {
    constructor(props) {
        super(props);
        // Dom reference
        this.videoRef = React.createRef();
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
        if(navigator.getUserMedia){
            navigator.mediaDevices.getUserMedia({video: true}).
            then((stream) => {this.videoRef.current.srcObject = stream; window.localStream = stream}).
            then(()=>{setInterval(this.getScreenShot, 300)})
        }

        this.props.socket.on('get_ear', (data) => {
            this.setState({ear: data.ear})
            console.log('ear', data.ear)
            console.log('delay', Date.now() - data.time)
            if(data.ear < 0.27){
                alert('blink')
            }
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
        return (
            <div>
                <video ref={this.videoRef} autoPlay></video>
                <button onClick={this.getScreenShot}>screenshot</button>
                {/*<img ref={this.imageRef}></img>*/} 
                {this.state.ear}
            </div>
        );
    }
}

