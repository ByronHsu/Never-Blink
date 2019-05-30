import React, {Component} from 'react';
import { objectMethod } from '@babel/types';

export default class Webcam extends Component {
	constructor(props) {
		super(props);
		const socket = this.props.socket;
		this.state = {
			socket: socket,
			image: ''
		}
		this.socket_init(socket)
	}

	socket_init(socket) {
		socket.on('connect', (obj) => {
			console.log("Connect to server!")
		})
		socket.on('get_image', (obj) => {
			const buffer = obj.image_data
			const img_str = String.fromCharCode.apply(null, new Uint8Array(buffer))
			this.setState({image: "data:image/jpeg;base64,"+btoa(img_str)})
		})
	}

	render(){
		return (
			<img src={this.state.image} />
		)
	}
}