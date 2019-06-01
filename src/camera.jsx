import React from 'react';
import ReactDOM from 'react-dom';


export default class Camera extends React.Component {
    constructor(props) {
        super(props);
        // Dom reference
        this.videoRef = React.createRef();
        
        // Set up media streaming (https://www.html5rocks.com/en/tutorials/getusermedia/intro/)
        navigator.mediaDevices.getUserMedia({video: true}).
        then((stream) => {this.videoRef.current.srcObject = stream; window.localStream = stream});
    }
    render() {
        return (
            <div>
                <video ref={this.videoRef} autoPlay></video>
            </div>
        );
    }
}

