# Facenao

## About

Facenao is a web application which connects the [NAO robot](https://www.ald.softbankrobotics.com/en/robots/nao/find-out-more-about-nao) and
the [PAZ](https://github.com/oarriaga/paz) library for perception for autonomous systems.
_(Originally, Facenao used the [Emotion recognition API](https://azure.microsoft.com/en-us/services/cognitive-services/emotion/) from [Microsoft Cognitive services](https://azure.microsoft.com/en-us/services/cognitive-services/). However, emotion recognition was shut down so I replaced it with PAZ which is open source, runs locally, and is very fast.)_

Facenao takes the image from the robot's camera, sends it to the PAZ library for face and emotion recognition and displays the results. The recognized faces are displayed along with their emotion scores. The "hall of fame" gallery displays faces with the highest emotion score seen so far.

**Important!** Please note that the code needs debugging and refactoring. Don't blame me if it eats your cat.


## Requirements

### Hardware

A NAO robot version v4, v5, or v6 running NAOqi OS version 2.x is required. It should also work with older Pepper robots (not tested).

### Software

The server side requires

- python 3.6+
- bottle
- paste
- Pillow
- pypaz (requires tensorflow and numpy)
- imageio (an optional requirement for creating animated GIFs from face images).

See `requirements.txt` for details.

The client side requires Bootstrap 3 and a number of Javascript libraries (jimp, vex, spin.js, jquery, ...). They are either included or linked in the code so you do not have to install anything.

**Important!**   NAOqi QiMessaging requires your web application server to use port 80. Since this port is not available to a normal user you can either
- (a) run as root (not recommended) or
- (b) use `authbind` (**recommended**).

Please see [here](https://www.mwells.org/coding/2016/authbind-port-80-443/) how to configure authbind. Once set up properly you can run Facenao like this:

```bash
authbind --depth 2 python3 facenao.py --port=80
```


### Bonus

The `make_animations.py` script can create animated GIFs from face images. For example:

```bash
python3 make_animations.py -m 50 -d 0.5 -w -o asc
```

will create animated GIFs for all emotions and all scores >= 50 with 0.5 second frame duration in ascending order and print the score under the images. Enjoy :)



## License

Facenao is licensed under the MIT license. The enclosed Javascript libraries [jimp](https://github.com/oliver-moran/jimp), [vex](https://github.com/hubspot/vex), and [spin.js](http://spin.js.org/) are also licensed under the MIT license.


## Contribute

Please note that the code is a quick and dirty demo which I created for a public exhibition. It badly needs cleanup and refactoring (especially the javascript part would benefit from using promises and a general cleaning). You are welcome to contribute.
