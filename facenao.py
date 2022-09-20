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

import numpy as np

import utils


bottle.BaseRequest.MEMFILE_MAX = 8 * 1024 * 1024 * 5

basedir = join(dirname(__file__), 'static')
#templatedir = join(dirname(__file__), 'templates')
templatedir = 'templates'
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


@post('/save_cameraimage_and_detect')
def saveimage():
    array = str(request.POST.get('rawimg', None))
    w = int(request.POST.get('width', None))
    h = int(request.POST.get('height', None))
    imid = str(request.POST.get('imid', None))
    if not array or not w or not h or not imid:
        return {'status': False}


    barray = base64.b64decode(array)
    image = Image.frombuffer("RGB", (w, h), barray, "raw", "RGB", 0, 1)
    locpath = join('static', 'media', 'camera', imid + '.jpg')
    fname = join(basepath, locpath)
    image.save(fname, quality=95)

    emodata = utils.detect_classify(np.array(image))

    emotiondata = {'imageid': imid, 'faceimages': [], 'apiresult': emodata}
    for i, result in enumerate(emodata):
        faceimg = Image.fromarray(result['face'])

        facefileid = '{}.{}.jpg'.format(imid, i)
        impath = join('static', 'media', 'faces', facefileid)
        fname = join(basepath, impath)
        faceimg.save(fname)

        result['facefile'] = impath   #facefileid
        result['scores'] = [(str(round(score, 2)), emotion) for score, emotion in result['scores']]  # convert float to str to enable JSON serialization
        del result['face']  # remove np array
        #emotiondata['faceimages'].append(facefileid)

    emofname = join('static', 'media', 'emotiondata', imid + '.pickle')
    emofname = join(basepath, emofname)
    with open(emofname, 'wb') as ofp:
        pickle.dump(emotiondata, ofp, 0)

    #print(emodata)
    return {'status': True,
            'imageLocation': locpath,
            'emotiondata': emodata}  # 'facefile'



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
