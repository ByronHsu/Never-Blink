#!/usr/bin/env python

import os
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit
from PIL import Image
import base64
import io
import cv2
import numpy as np
from detect import Eye_Detector
from OpenSSL import SSL

app = Flask(__name__)
socketio = SocketIO(app)
id_list = []
detector = Eye_Detector()
# context = SSL.Context(SSL.SSLv23_METHOD)
# context.use_privatekey_file('host.key')
# context.use_certificate_file('host.cert')

@socketio.on('connect')
def on_connect():
    # print(request)
    client_id = request.args['id']
    if client_id not in id_list:
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

@socketio.on('send_image')
def handle_message(message):
    """
    args:
        message: Base64 string from client
    process:
        https://stackoverflow.com/questions/16214190/how-to-convert-base64-string-to-image/16214280
        https://stackoverflow.com/questions/902761/saving-a-numpy-array-as-an-image
        decode base64 and convert to rgb numpy array
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
    # # app.run(host='0.0.0.0', port=3000, ssl_context = context)
    socketio.run(app, host='0.0.0.0', port=4000)# , keyfile='key.pem', certfile='cert.pem')
