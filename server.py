#!/usr/bin/env python

import os
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit
app = Flask(__name__)
socketio = SocketIO(app)
id_list = []

@socketio.on('connect')
def on_connect():
    # print(request)
    client_id = request.args['id']
    id_list.append(client_id)
    print(client_id, 'connected !')
    # broadcast
    socketio.emit('get_id_list', {'id_list': id_list})


@socketio.on('_disconnect')
def dis_connect(message):
    client_id = message['id']
    id_list.remove(client_id)
    print(client_id, 'disconnected !')
    # broadcast
    socketio.emit('get_id_list', {'id_list': id_list})

@socketio.on('message')
def handle_message(message):
    print('handle_message')
    print('message', message) 
    send(message)

@app.route("/")
def index():
    return render_template('index.html')

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=3000)
