# Facenao

## About

Facenao is a web application which connects the [NAO robot](https://www.ald.softbankrobotics.com/en/robots/nao/find-out-more-about-nao) and the [Emotion recognition API](https://azure.microsoft.com/en-us/services/cognitive-services/emotion/) from [Microsoft Cognitive services](https://azure.microsoft.com/en-us/services/cognitive-services/).

Facenao takes the image from the robot's camera, sends it to the Emotion API service and displays the results. The recognized faces are displayed along with their emotion scores. The "hall of fame" gallery displays faces with the highest emotion score seen so far.

**Important!** Please note that the code needs debugging and refactoring. Don't blame me if it eats your cat.


## Requirements

### Hardware

A NAO robot version v4 or v5 running NAOqi OS version 2.x is required. It should also work with Pepper (not tested).

### Software

The server side requires Python 3.4+, `bottle`, `paste` and `Pillow`. `imageio` is an optional requirement if you want to create animated GIFs from face images. See `requirements.txt` for details.

The client side requires Bootstrap 3 and a number of Javascript libraries (jimp, vex, spin.js, jquery, ...). They are either included or linked in the code so you do not have to install anything.

**Important!**   NAOqi QiMessaging requires your web application server to use port 80. Since this port is not available to a normal user you can either
- (a) run as root (not recommended) or
- (b) use `authbind` (**recommended**).

Please see [here](https://debian-administration.org/article/386/Running_network_services_as_a_non-root_user) how to configure authbind. Once set up properly you can run Facenao like this:

```bash
authbind --depth 2 python3 facenao.py --port=80
```

### Other

Facenao also requires an API key for Microsoft Cognitive Services. You can get one for free [here](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/emotion-api/).
You will have to create a file `templates/api-keys.js` with the following content:

```javascript
var key_1 = "your API key 1";
var key_2 = "your API key 2";
```
This file will be included into the main page template thus setting the required `key_1` variable (`key_2` is ignored at the moment).


### Bonus

The `make_animations.py` script can create animated GIFs from face images. For example:

```bash
python3 make_animations.py -m 50 -d 0.5 -w -o asc
```

will create animated GIFs for all emotions and all scores >= 50 with 0.5 second frame duration in ascending order and print the score under the images. Enjoy :)




## License

Facenao is licensed under the MIT license. The enclosed Javascript libraries [jimp](https://github.com/oliver-moran/jimp), [vex](https://github.com/hubspot/vex), and [spin.js](http://spin.js.org/) are also licensed under the MIT license.


## Contribute

Please note that the code is a quick and dirty demo which I created for a public exhibition. It badly needs cleanup and refactoring (especially the javascript part). You are welcome to contribute.
