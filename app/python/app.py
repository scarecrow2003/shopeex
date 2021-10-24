from flask import Flask, request, jsonify
import os
import shutil
from PIL import Image
from pyzbar.pyzbar import decode
from datetime import datetime
from pathlib import Path
import logging

app = Flask(__name__)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG, filename='/var/log/python.log', filemode='w')


@app.route('/')
def hello():
    return 'Hello World!'


@app.route('/load')
def load_photos():
    files = []
    output = []
    with os.scandir('/files') as dir_contents:
        for entry in dir_contents:
            _, file_extension = os.path.splitext(entry.name)
            if file_extension.lower() == '.jpg':
                info = entry.stat()
                file = (entry.name, info.st_mtime)
                files.append(file)
    if len(files) > 0:
        files.sort(key=lambda tup: tup[1])
        for file in files:
            shutil.move('/files/' + file[0], '/web/placeholder/' + file[0])
            data = decode(Image.open('/web/placeholder/' + file[0]))
            output.append(file[0])
            if len(data) > 0:
                output.append("true")
            else:
                output.append("false")
    return ",".join(output)


@app.route('/confirm', methods=['POST'])
def confirm_photos():
    req = request.form
    photos = req.get('photos').split(',')
    photo_dic = {photos[i]: True for i in range(0, len(photos))}

    result = []
    files = []
    with os.scandir('/web/placeholder') as dir_contents:
        for entry in dir_contents:
            _, file_extension = os.path.splitext(entry.name)
            if file_extension.lower() == '.jpg':
                if entry.name in photo_dic:
                    data = decode(Image.open('/web/placeholder/' + entry.name))
                    if len(data) > 0:
                        code = data[0].data.decode('utf-8')
                        files.append((entry.name, entry.stat().st_mtime, True, True, code))
                    else:
                        files.append((entry.name, entry.stat().st_mtime, True, False, ''))
                        logger.warning(f'Unknown qrcode for file {entry.name}')
                else:
                    files.append((entry.name, entry.stat().st_mtime, False, False, ''))
    if len(files) > 0:
        today = datetime.today().strftime('%Y%m%d')
        Path('/web/final/' + today).mkdir(parents=True, exist_ok=True)
        Path('/web/final/' + today + '/unknown').mkdir(parents=True, exist_ok=True)
        files.sort(key=lambda tup: tup[1])
        start = 0
        has_no_code_file = False
        has_code_file = False
        has_unknown = False
        for x in range(len(files)):
            logger.warning(f'File {files[x][0]} with time {files[x][1]}')
            if (has_no_code_file and files[x][2]) or x == len(files) - 1:
                end = x if x == len(files) - 1 else x - 1
                codes = process(files, start, end, has_code_file, has_unknown)
                if len(codes) != 0:
                    result.append(codes)
                start = x
                has_no_code_file = False
                has_code_file = True
                has_unknown = not files[x][3]
            else:
                if files[x][2]:
                    if not files[x][3]:
                        has_unknown = True
                    has_code_file = True
                else:
                    has_no_code_file = True
    return jsonify(result)


def process(files, start, end, has_code_file, has_unknown):
    today = datetime.today().strftime('%Y%m%d')
    codes = []
    if has_unknown or not has_code_file:
        for x in range(start, end+1):
            shutil.move('/web/placeholder/' + files[x][0], '/web/final/' + today + '/unknown/' + files[x][0])
    else:
        code = ''
        position = 0
        for x in range(start, end+1):
            if files[x][2]:
                code = files[x][4]
                codes.append(code)
                position = 0
                append = ''
            else:
                position += 1
                append = '-' + str(position)
            shutil.move('/web/placeholder/' + files[x][0], '/web/final/' + today + '/' + code + append + '.jpg')
    return codes
