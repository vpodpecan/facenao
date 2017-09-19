"""
@author: vid.podpecan@ijs.si
"""
try:
    from os import scandir
except ImportError:
    from scandir import scandir
from os.path import splitext
import pickle

EMOTIONS = ['anger', 'contempt', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']


def findMaxEmotions(dirname):
    max_emotions = dict.fromkeys(EMOTIONS)
    for e in EMOTIONS:
        max_emotions[e] = {'score': None, 'image': None}
    # Python 3.6 only
    # with scandir(dirname) as it:
    #     for entry in it:
    for entry in scandir(dirname):
        fname = entry.path
        if entry.is_file() and splitext(fname)[1].lower() == '.pickle':
            with open(fname, 'rb') as fp:
                d = pickle.load(fp)
                for emotion in EMOTIONS:
                    for facedata in d['apiresult']:
                        current_emotion = facedata['scores'][emotion]
                        if max_emotions[emotion]['score'] is None or max_emotions[emotion]['score'] < current_emotion:
                            max_emotions[emotion]['score'] = current_emotion
                            max_emotions[emotion]['image'] = facedata['facefile']
    return max_emotions
