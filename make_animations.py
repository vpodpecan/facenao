"""
@author: vid.podpecan@ijs.si
"""
from PIL import Image, ImageDraw, ImageFont
import imageio
from os import scandir
from os.path import splitext, join
import tempfile
import pickle
import sys
import argparse

from utils import EMOTIONS


def writeScore(imfile, score, printScore=True):
    im = Image.open(imfile)
    im.thumbnail((200, 200), resample=Image.BICUBIC)
    outfile = tempfile.NamedTemporaryFile(suffix='.png')

    if printScore:
        # create a bigger white base image with a space for text and paste the original into it
        base = Image.new('RGB', (im.width, im.height+50), color='white')
        base.paste(im)

        font = ImageFont.truetype("/usr/share/fonts/TTF/LiberationMono-Regular.ttf", size=32)
        imdraw = ImageDraw.Draw(base)
        # hardcoded hack to put the text approximately in the middle
        imdraw.text((im.width/3, im.height+10), '{:.0f}%'.format(score), fill='black', font=font)
        base.save(outfile)
    else:
        im.save(outfile)

    outfile.flush()
    return outfile
# end


def collectScores(reverseOrder=False):
    scoredFaces = {}
    for em in EMOTIONS:
        scoredFaces[em] = []

    for entry in scandir('static/media/emotiondata'):
        fname = entry.path
        if entry.is_file() and splitext(fname)[1].lower() == '.pickle':
            with open(fname, 'rb') as emofile:
                emodata = pickle.load(emofile)
                apidata = emodata['apiresult']
                for facedata in apidata:
                    scores = facedata['scores']
                    facefile = facedata['facefile']
                    for emotion in scores:
                        value = scores[emotion]
                        scoredFaces[emotion].append((value*100, join('static/media/faces', facefile)))
    for em in EMOTIONS:
        scoredFaces[em].sort(reverse=reverseOrder)
    return scoredFaces
# end


def makeMovie(scores, scoreLimit=50, frameDuration=0.75, printScore=True):
    sys.stdout.write('Creating animated GIFs, please wait...\n')
    for em in EMOTIONS:
        with imageio.get_writer(join('static/media/animations', '{}.gif'.format(em)), mode='I', duration=frameDuration, loop=1) as writer:
            for score, impath in scores[em]:
                if score >= scoreLimit:
                    newimg = writeScore(impath, score, printScore=printScore)
                    image = imageio.imread(newimg.name)
                    writer.append_data(image)
        sys.stdout.write('Processing of "{}" completed.\n'.format(em))
# end


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('-d', '--duration', type=float, help='GIF image frame duration')
    parser.add_argument('-m', '--minscore', type=int, choices=range(1, 100), help='lower limit for face emotion score')
    parser.add_argument('-o', '--order', type=str, choices=['asc', 'desc'], help='order (ascending or descending')
    parser.add_argument('-w', '--writescore', action='store_true', help='order (ascending or descending')

    args = parser.parse_args()

    scores = collectScores(reverseOrder=True) if args.order == 'desc' else collectScores()
    makeMovie(scores, scoreLimit=args.minscore, frameDuration=args.duration, printScore=args.writescore)
