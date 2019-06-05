#!/usr/bin/env python

import os
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit
from PIL import Image
import base64
import io
import cv2
import numpy as np
import random
from detect import Eye_Detector

app = Flask(__name__)
socketio = SocketIO(app)
player_list = []
detector = Eye_Detector()

def find_by_id(_id):
    filt = [i for (i, item) in enumerate(player_list) if item['id'] == _id]
    index = None if len(filt) == 0 else filt[0]
    return index

def find_random_waiting(_id):
    filt = [i for (i, item) in enumerate(player_list) if (item['status'] == 'waiting' and item['id'] != _id )]
    if len(filt):
      index = random.choice(filt)
    else:
      index = None
    return index

@socketio.on('connect')
def on_connect():
    client_id = request.args['id']
    index = find_by_id(client_id)
    if not index:
        player_list.append({'id': client_id, 'status': 'idle', 'ear': 0, 'rival': None})
    print(client_id, 'connected !')

@socketio.on('disconnect')
def _disconnect():
    pass

@socketio.on('_disconnect')
def on_disconnect(message):
    client_id = message['id']
    index = find_by_id(client_id)
    del player_list[index]
    print(client_id, 'disconnected !')

@socketio.on('set_player')
def set_player(message):
    client_id = message['id']
    curr_index = find_by_id(client_id)
    player_list[index]['status'] = 'waiting'
    rival_index = find_random_waiting(client_id)
    print('rival_index', rival_index)
    player_list[curr_index]['rival'] = rival_index
    player_list[rival_index]['rival'] = curr_index

    print(client_id, 'set to waiting...')

@socketio.on('send_image')
def handle_message(message):
    """
    https://stackoverflow.com/questions/16214190/how-to-convert-base64-string-to-image/16214280
    https://stackoverflow.com/questions/902761/saving-a-numpy-array-as-an-image
    decode base64 and convert to rgb numpy array
    args:
        message: Base64 string from client
    return:

    """
    # print(message)
    # input()
    uri, time = message['uri'], message['time']
    # split header and body
    img_data = uri.split(',')[1]
    img_data = base64.b64decode(img_data)
    image = Image.open(io.BytesIO(img_data))
    # bgr
    array = np.array(image)
    # array = cv2.resize(array, (0,0), fx=0.3, fy=0.3)
    # print(array.shape)
    ear = detector.calculate_ear(array)
    print(ear)
    if ear != 0: # not detect the eyes
        socketio.emit('get_ear', {'ear': ear, 'time': time})
    # convert decoded data to numpy array(rgb)
    # array = cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)
    # cv2.imwrite("filename.png", array)
    # print(array.shape)

@app.route("/")
def index():
    return render_template('index.html')

if __name__ == "__main__":
    # context = ('host.cert', 'host.key')
    # app.run(host='0.0.0.0', port=3000, ssl_context = 'adhoc')
    # bug: https://stackoverflow.com/questions/51862313/navigator-getusermedia-not-working-on-android-chrome
    socketio.run(app, host='0.0.0.0', port=3000)#, ssl_context='adhoc')# , keyfile='key.pem', certfile='cert.pem')
