"""
@author: vid.podpecan@ijs.si
"""
from os import scandir
from os.path import splitext
import pickle


from paz.applications import HaarCascadeFrontalFace, MiniXceptionFER
import paz.processors as pr

#from PIL import Image
#import numpy as np
#from IPython.display import display


#EMOTIONS = ['anger', 'contempt', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']
EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']


def detect_classify(imarray):
    # img = np.array(Image.open('test1.png'))
    boxes2D = HaarCascadeFrontalFace(draw=False)(imarray)['boxes2D']
    cropped_images = pr.CropBoxes2D()(imarray, boxes2D)
    xcept = MiniXceptionFER()
    # print(xcept.class_names)
    results = []
    for cropped_image, box2D in zip(cropped_images, boxes2D):
        prediction = xcept(cropped_image)
        klas = prediction['class_name']
        # score = prediction['scores'].ravel()[xcept.class_names.index(klas)]
        scores = sorted([(score, emotion) for emotion, score in zip(xcept.class_names, prediction['scores'].ravel())], reverse=True)
        # print(klas, score)
        # display(Image.fromarray(cropped_image))
        results.append({'face': cropped_image,
                        'emotion': klas,
                        'scores': scores})
    return results


def findMaxEmotions(dirname):
    max_emotions = dict.fromkeys(EMOTIONS)
    for e in EMOTIONS:
        max_emotions[e] = {'score': None, 'image': None}
    #return max_emotions

    with scandir(dirname) as it:
        for entry in it:
            fname = entry.path
            if entry.is_file() and splitext(fname)[1].lower() == '.pickle':
                with open(fname, 'rb') as fp:
                    d = pickle.load(fp)
                    for emotion in EMOTIONS:
                        for result in d['apiresult']:
                            if result['emotion'] == emotion:
                                curr_score = float(result['scores'][0][0])
                                if max_emotions[emotion]['score'] is None or max_emotions[emotion]['score'] < curr_score:
                                    max_emotions[emotion]['score'] = curr_score
                                    max_emotions[emotion]['image'] = result['facefile']
    return max_emotions
