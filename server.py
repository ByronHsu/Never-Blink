import os
from flask import Flask, request, send_from_directory
from flask_socketio import SocketIO, emit
import requests
from flask_cors import CORS

app = Flask(__name__, static_folder='build')
CORS(app)
io = SocketIO(app)

img_file = None

@app.route("/api", methods=["POST"])
def decode():
	global img_file
	img_file = request.files['webcam']
	return "POST received!"

@app.route("/", defaults={'path': ''})
@app.route("/<path:path>")
def render(path):
	print (path)
	if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
		return send_from_directory(app.static_folder, path)
	else:
		return send_from_directory(app.static_folder, 'index.html')

	

if __name__ == "__main__":
	app.run()