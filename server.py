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
import time
from flask_sslify import SSLify
from detect import Eye_Detector

app = Flask(__name__)
socketio = SocketIO(app)
player_list = []
detector = Eye_Detector()
SSLify(app)

# prevent cached responses(https://stackoverflow.com/questions/47376744/how-to-prevent-cached-response-flask-server-using-chrome)
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response

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
        player_list.append({'id': client_id, 'status': 'idle', 'ear': 0, 'rival': None, 'startTime': 0, 'end': 0})
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
    player_list[curr_index]['status'] = 'waiting'
    print(client_id, 'set to waiting...')
    # look for rival
    rival_index = find_random_waiting(client_id)
    if rival_index != None:
      rival_id = player_list[rival_index]['id']
      player_list[curr_index]['rival'] = rival_id
      player_list[curr_index]['status'] = 'playing'
      
      player_list[rival_index]['rival'] = client_id
      player_list[rival_index]['status'] = 'playing'

      emit('get_rival', {'id': rival_id})
      print(client_id, 'find rival', rival_id)

@socketio.on('set_player_startTime')
def set_player_startTime(message):
    client_id = message['id']
    curr_index = find_by_id(client_id)
    player_list[curr_index]['startTime'] = time.time()
    print('startTime', player_list[curr_index])

@socketio.on('send_image')
def handle_message(message):
    """
    https://stackoverflow.com/questions/16214190/how-to-convert-base64-string-to-image/16214280
    https://stackoverflow.com/questions/902761/saving-a-numpy-array-as-an-image
    decode base64 and convert to rgb numpy array
    args:
        message: Base64 string from client
    return:
        emit arena status including ear1, ear2, now-time-stamp
    """
    # print(message['id'])
    uri, _id = message['uri'], message['id']
    # split header and body
    img_data = uri.split(',')[1]
    img_data = base64.b64decode(img_data)
    image = Image.open(io.BytesIO(img_data))
    # bgr
    array = np.array(image)
    

    REJECT = 0
    # if ear1 <= REJECT: return
    # set player's data
    index = find_by_id(_id)
    ear1 = player_list[index]['ear']
    if player_list[index]['end'] == 0:
      ear1 = detector.calculate_ear(array)
      # if ear1 != 0:
      player_list[index]['ear'] = ear1

    rival_id = player_list[index]['rival']
    rival_index = find_by_id(rival_id)
    ear2 = player_list[rival_index]['ear']

    elapsed = time.time() - player_list[index]['startTime']
    
    threshold = 0.25
    if (ear1 < threshold or ear2 < threshold) and elapsed > 3:
      player_list[index]['end'] = 1
      player_list[index]['status'] = 'idle'
      player_list[rival_index]['end'] = 1
      player_list[rival_index]['status'] = 'idle'
      emit('get_arena_data', {'ear1': ear1, 'ear2': ear2, 'elapsed': elapsed, 'end': 1})
    else:
      emit('get_arena_data', {'ear1': ear1, 'ear2': ear2, 'elapsed': elapsed, 'end': 0})

@app.route("/")
def index():
    return render_template('index.html')

if __name__ == "__main__":
    # bug: https://stackoverflow.com/questions/51862313/navigator-getusermedia-not-working-on-android-chrome
    socketio.run(app, host='0.0.0.0', port=3000, keyfile='server.key', certfile='server.crt')
