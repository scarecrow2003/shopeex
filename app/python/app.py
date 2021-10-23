from flask import Flask, request
import os
import shutil
from PIL import Image
from pyzbar.pyzbar import decode
from datetime import datetime
from pathlib import Path

app = Flask(__name__)


@app.route('/')
def hello():
    return 'Hello World!'


@app.route('/load')
def load_photos():
    files = []
    output = []
    with os.scandir('/files') as dir_contents:
        for entry in dir_contents:
            info = entry.stat()
            file = (entry.name, info.st_mtime)
            files.append(file)
    if len(files) > 0:
        files.sort(key = lambda tup: tup[1])
        for file in files:
            shutil.move('/files/' + file[0], '/web/placeholder/' + file[0])
            data = decode(Image.open('/web/placeholder/' + file[0]))
            output.append(file[0])
            if len(data) > 0:
                output.append("true")
            else:
                output.append("false")
    return ",".join(output)


@app.route('/confirm', methods = ['POST'])
def confirm_photos():
    req = request.form
    photos = req.get('photos').split(',')
    photoDic = {photos[i]: True for i in range(0, len(photos))}

    files = []
    codes = []
    with os.scandir('/web/placeholder') as dir_contents:
        for entry in dir_contents:
            code = ''
            if entry.name in photoDic:
                data = decode(Image.open('/web/placeholder/' + entry.name))
                if len(data) > 0:
                    code = data[0].data.decode('utf-8')
                    codes.append(code)
            files.append((entry.name, entry.stat().st_mtime, code))
    if len(files) > 0:
        today = datetime.today().strftime('%Y%m%d')
        Path('/web/final/' + today).mkdir(parents=True, exist_ok=True)
        files.sort(key = lambda tup: tup[1])
        code = ''
        position = 0
        for x in range(len(files)):
            if files[x][2] != '':
                code = files[x][2]
                position = 0
                append = ''
            else:
                position += 1
                append = '-' + str(position)
            shutil.move('/web/placeholder/' + files[x][0], '/web/final/' + today + '/' + code + append + '.jpg')
    return ",".join(codes)

