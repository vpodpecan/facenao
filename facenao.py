"""
@author: vid.podpecan@ijs.si
"""
import bottle
from bottle import route, template, static_file, run, request, post, get, default_app, debug, redirect
from PIL import Image
import base64

from paste import httpserver
from paste.translogger import TransLogger

import argparse
import json

from os.path import join, dirname, abspath, exists
import sys
import pickle

import utils


bottle.BaseRequest.MEMFILE_MAX = 8 * 1024 * 1024 * 5

basedir = join(dirname(__file__), 'static')
templatedir = join(dirname(__file__), 'templates')
basepath = dirname(abspath(__file__))

logformat = ('%(REMOTE_ADDR)s [%(time)s] '
             '"%(REQUEST_METHOD)s %(REQUEST_URI)s %(HTTP_VERSION)s" '
             '%(status)s %(bytes)s "%(HTTP_REFERER)s" "%(HTTP_USER_AGENT)s"')
logfile = join(basedir, 'logfile')


@route('/static/<filename:path>')
def send_static(filename):
    return static_file(filename, root=basedir)


@route('/')
def root():
    return template(join(templatedir, 'base.html'))


@post('/save_cameraimage')
def saveimage():
    array = str(request.POST.get('rawimg', None))
    w = int(request.POST.get('width', None))
    h = int(request.POST.get('height', None))
    imid = str(request.POST.get('imid', None))
    if not array or not w or not h or not imid:
        return {'status': False}

    try:
        barray = base64.b64decode(array)
        im = Image.frombuffer("RGB", (w, h), barray, "raw", "RGB", 0, 1)
        locpath = join('static', 'media', 'camera', imid + '.jpg')
        fname = join(basepath, locpath)
        im.save(fname, quality=95)
    except:
        return {'status': False}
    else:
        return {'status': locpath}
# end


@post('/save_emotiondata')
def saveemotions():
    imid = str(request.POST.get('imid', None))
    emodata = str(request.POST.get('emodata', None))
    if not imid or not emodata:
        return {'status': False, 'message': 'Invalid request data'}

    try:
        emodata = json.loads(emodata)
    except:
        return {'status': False, 'message': 'Invalid emotion JSON data'}

    impath = join('static', 'media', 'camera', imid + '.jpg')
    if not exists(impath):
        return {'status': False, 'message': 'Image does not exist'}

    emotiondata = {'imageid': imid, 'faceimages': [], 'apiresult': emodata}
    image = Image.open(impath)
    for i, face in enumerate(emodata):
        facedata = face['faceRectangle']
        faceimg = image.crop((facedata['left'], facedata['top'], facedata['width']+facedata['left'], facedata['height']+facedata['top']))

        facefileid = '{}.{}.jpg'.format(imid, i)
        impath = join('static', 'media', 'faces', facefileid)
        fname = join(basepath, impath)
        faceimg.save(fname)

        face['facefile'] = facefileid
        emotiondata['faceimages'].append(facefileid)

    emofname = join('static', 'media', 'emotiondata', imid + '.pickle')
    emofname = join(basepath, emofname)
    with open(emofname, 'wb') as ofp:
        pickle.dump(emotiondata, ofp, 0)

    return {'status': True, 'faceimages': emotiondata['faceimages']}


@post('/get_hof')
def getmaxemotions():
    folder = join(basepath, 'static', 'media', 'emotiondata')
    maxem = utils.findMaxEmotions(folder)
    return {'status': True, 'maxemotions': maxem}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', default=80, type=int, help='port')
    parser.add_argument('--production', action='store_true')
    args = parser.parse_args()

    application = default_app()
    if args.production:
        httpserver.serve(TransLogger(application, format=logformat), host='0.0.0.0', port=args.port)
    else:
        run(app=application, host='127.0.0.1', port=args.port, reloader=True, quiet=False, debug=True)
