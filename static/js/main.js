
var clickDelay = 5000;
var ignoreKeyboard = false;
var startTime = null;
var session = null;
var nao_address = null;
var animate = 0;
var volume = 0.85;
var speed = 80;
var spinopts = {
    lines: 17 // The number of lines to draw
        ,
    length: 56 // The length of each line
        ,
    width: 33 // The line thickness
        ,
    radius: 84 // The radius of the inner circle
        ,
    scale: 1 // Scales overall size of the spinner
        ,
    corners: 1 // Corner roundness (0..1)
        ,
    color: '#000' // #rgb or #rrggbb or array of colors
        ,
    opacity: 0.1 // Opacity of the lines
        ,
    rotate: 0 // The rotation offset
        ,
    direction: 1 // 1: clockwise, -1: counterclockwise
        ,
    speed: 0.75 // Rounds per second
        ,
    trail: 61 // Afterglow percentage
        ,
    fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        ,
    zIndex: 2e9 // The z-index (defaults to 2000000000)
        ,
    className: 'spinner' // The CSS class to assign to the spinner
        ,
    top: '50%' // Top position relative to parent
        ,
    left: '50%' // Left position relative to parent
        ,
    shadow: false // Whether to render a shadow
        ,
    hwaccel: false // Whether to use hardware acceleration
        ,
    position: 'absolute' // Element positioning
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    b64Data = b64Data.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {
        type: contentType
    });
    return blob;
}

function ValidateIPaddress(ipaddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
        return (true)
    } else {
        return (false)
    }
}


function writeText(s) {
    vex.dialog.alert(s);
}

function initNao(naoip) {
    var jsQim = '/libs/qimessaging/1.0/qimessaging.js';
    jsQim = 'http://' + naoip + jsQim;
    $.getScript(jsQim, function() {
        console.log('QiMessaging Library Loaded');
        $.getScript('static/js/jsnao.js', function() {
            // $(document).ready(function() {
            jsnao.connect(naoip);
            // })
        })
    })
}

function isNAOconnected() {
    return (typeof jsnao === 'undefined' || !jsnao.al_sys) ? false : true;
}

function connectRobot(ipaddr) {
    nip = ipaddr.replace('ip:', '').trim();

    if (!ValidateIPaddress(nip)) {
        writeText('ERROR: invalid robot ip!');
    } else if (isNAOconnected()) {
        writeText('Robot already connected');
    } else {
        initNao(nip);
        setTimeout(function() {
            if (isNAOconnected()) {
                localStorage.setItem('nao_address', nip);
                // writeText('Connection to the robot has been established.')
            } else {
                localStorage.setItem('nao_address', nip);
                writeText('Error: cannot connect to robot at ' + nao_address)
            }
        }, 3000);
    }
}


function saveCameraImage(imid, imgBase64, imgWidth, imgHeight, okcb) {
    $.post("/save_cameraimage", {
            'rawimg': imgBase64,
            'width': imgWidth,
            'height': imgHeight,
            'imid': imid
        })
        .done(function(data) {
            if (!data.status) {
                writeText('Server error while calling save_cameraimage');
            }
            okcb(data.status);
        })
        .fail(function(err) {
            writeText('POST request failed');
        })
}


function saveEmotionData(imid, emodata, okcb){
    $.post("/save_emotiondata", {
            'imid': imid,
            'emodata': JSON.stringify(emodata)
        })
        .done(function(data) {
            if (!data.status) {
                writeText('Server error while calling save_emotiondata: ' + status.message);
            }
            okcb(data);
        })
        .fail(function(err) {
            writeText('POST request failed');
        })
}

function loadHOF() {
    $.post("/get_hof")
        .done(function(data) {
            if (!data.status) {
                writeText('Server error while calling get_hof: ' + status.message);
            }

            var emotions = ['anger', 'contempt', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise'];
            for (var i=0; i<emotions.length; i++) {
                var em = emotions[i];
                if (data['maxemotions'][em]['image']!=null  && data['maxemotions'][em]['image'] != $('#' + em + ' img').attr('src')) {
                    $('#' + em + ' img').attr('src', '/static/media/faces/' + data['maxemotions'][em]['image']);
                    $('#' + em + ' figcaption').text(formatScore(data['maxemotions'][em]['score']));
                }
            }

        })
        .fail(function(err) {
            writeText('POST request failed');
        })
}

function formatScore(v) {
    return (Math.round(v * 1000) / 10).toString() + '%'
}

$(document).ready(function() {
    startTime = new Date().getTime() - clickDelay;  //first click can be immediate
    $("#infotext").show();

    // NAO setup
    nao_address = localStorage.getItem('nao_address');
    if (nao_address) {
        connectRobot(nao_address);
    }

    loadHOF();

    // 32 space
    // 13 enter

    $('body').keyup(function(event){
        if (ignoreKeyboard) {
            return
        }
        // enter:13, space:32
        if (event.keyCode==13 || event.keyCode==32){
             $('#takepicbtn').click();
        }
    })


    $('#setupbtn').click(function() {
        ignoreKeyboard = true;

        vex.dialog.prompt({
            message: 'Enter robot command:',
            placeholder: 'name:value',
            // value: 'ip:' + localStorage.getItem('nao_address'),
            callback: function (command) {
                setTimeout(function() {
                    ignoreKeyboard = false;
                }, 1000)

                if(!command || !command.trim()){
                    return
                }

                var question = command.trim();
                if (question.indexOf('ip:') != -1) {
                    connectRobot(question);
                    return;
                }
                if (question.indexOf('animate:') != -1) {
                    animate = parseInt(question.replace('animate:', '').trim())
                    animate = animate <= 0 ? 0 : 1;
                    writeText('INFO: animate set to ' + animate);
                    return
                }
                if (question.indexOf('speed:') != -1) {
                    speed = parseInt(question.replace('speed:', '').trim())
                    speed = Math.min(100, Math.max(50, speed));
                    writeText('INFO: speed set to ' + speed);
                    return
                }
                if (question.indexOf('volume:') != -1) {
                    volume = parseFloat($.trim(question.replace('volume:', '')));
                    if (volume >= 1 && volume <= 100) {
                        volume = volume / 100;
                    }
                    volume = Math.min(0.90, Math.max(0.20, volume));
                    writeText('INFO: volume set to ' + volume);
                    return
                }
                if (question.indexOf('say:') != -1) {
                    text = ' \\RSPD=' + speed + '\\ ' + question.replace('say:', '').trim();
                    if (animate) {
                        jsnao.al_atts.say(text).done(function() {
                            jsnao.al_posture.goToPosture('Stand', 0.7);
                        })
                    } else {
                        jsnao.al_tts.say(text);
                    }
                    return
                }
            }
        })
    })

    // main program
    $('#takepicbtn').click(function() {

        // ignore if keyboard events fire too many clicks...
        var diff = (new Date().getTime()-startTime);
        if (diff < clickDelay) {
            console.log('Click event ignored ' + diff/1000);
            return;
        }
        startTime = new Date().getTime();

        if (!isNAOconnected()) {
            writeText('ERROR: robot not connected!')
            return
        } else {

            // var target = document.getElementById('naosnapshot');
            $('button').attr("disabled", true);
            $("#infotext").hide();
            var target = $('body')[0];
            var spinner = new Spinner(spinopts).spin(target);


            var imgbasename = new Date().toISOString();
            var subscribename = "test" + Math.random().toString();
            jsnao.al_video.subscribeCamera(subscribename, 0, 2, 11, 30).fail(jsnao.error).done(function(sname) {
                jsnao.sname = sname;

                // 7: 80x60
                // 2: 640x480
                // 3: 1280x960

                $('#clicksound')[0].play();
                jsnao.al_video.getImageRemote(jsnao.sname).fail(jsnao.error).done(function(data) {
                    var imgBase64 = data[6];
                    // var imgWidth = 1280;
                    // var imgHeight = 960;

                    var imgHeight = 480;
                    var imgWidth = 640;

                    saveCameraImage(imgbasename, imgBase64, imgWidth, imgHeight, function(imurl) {
                        Jimp.read(imurl).then(function(image) {
                            var displayImage = image.clone();
                            displayImage.scaleToFit(1200, 500);


                            image.scaleToFit(640,480);

                            if(image.bitmap.width > 1920 || image.bitmap.height > 1200) {
                                image.scaleToFit(1920, 1200);
                            }

                            image.getBase64(Jimp.MIME_JPEG, function(err, src) {
                                displayImage.getBase64(Jimp.MIME_JPEG, function(err, src) {
                                    $('#naosnapshot').empty();
                                    $('#naosnapshot').append('<figure><img src="' + src + '"/></figure>');
                                });

                                var imgblob = b64toBlob(src);
                                faceEmotionAPI(imgblob, function(data) {
                                    spinner.stop();
                                    $('#faces').empty();
                                    saveEmotionData(imgbasename, data, function(facedata){
                                        // console.log(facedata.faceimages);
                                    });

                                    for (var i = 0; i < data.length; i++) {
                                        var face = data[i].faceRectangle;
                                        var emos = data[i].scores;
                                        var faceimg = image.clone();
                                        faceimg.crop(face.left, face.top, face.width, face.height);
                                        faceimg.scaleToFit(200, 200);

                                        // sort descending
                                        var sortedEmos = new Array;
                                        for (var sc in emos) {
                                            if (emos.hasOwnProperty(sc)) {
                                                sortedEmos.push([sc, emos[sc]]);
                                            }
                                        }
                                        sortedEmos.sort(function(a, b) {
                                            return b[1] - a[1];
                                        })

                                        var caption = '';
                                        for (var j=0; j<sortedEmos.length; j++) {
                                            var val = Math.round(sortedEmos[j][1] * 1000) / 10;
                                            if (val > 0) {
                                                if (j==0) {
                                                    caption += '<strong>' + sortedEmos[j][0] + ': ' + val.toString() + '%' + '</strong>' + '</br>'
                                                }
                                                else {
                                                    caption += sortedEmos[j][0] + ': ' + val.toString() + '%' + '</br>'
                                                }
                                            }
                                        }

                                        // console.log(caption);
                                        faceimg.getBase64(Jimp.MIME_JPEG, function(err, src) {
                                            $('#faces').append('<figure><img src="' + src + '"/><figcaption>' + caption + '</figcaption></figure>');
                                        });
                                    }

                                    if (data.length > 0) {
                                        var naotext = 'I see ';
                                        if (data.length == 1) {
                                            naotext += 'one person.'
                                        }
                                        else if (data.length > 1) {
                                            naotext += data.length + ' persons.'
                                        }
                                        jsnao.al_tts.say(naotext);
                                    }
                                    else{
                                        jsnao.al_tts.say("Sorry, I don't see any face clearly enough!");
                                    }

                                    $('button').removeAttr("disabled");
                                    loadHOF();

                                }, function(err) {
                                    spinner.stop();
                                    $('button').removeAttr("disabled");
                                    writeText('Error while calling face emotion service: ' + err);
                                })
                            });
                            // console.log(results);

                        }).catch(function(err) {
                            writeText('Error while reading image ' + imurl);
                        });
                    });

                });
                jsnao.al_video.unsubscribe(subscribename)
            });

        }
    })

    function faceEmotionAPI(imgblob, okcallback, errcallback) {
        $.ajax({
                //  var params = {};
                // NOTE: You must use the same location in your REST call as you used to obtain your subscription keys.
                //   For example, if you obtained your subscription keys from westcentralus, replace "westus" in the
                //   URL below with "westcentralus".
                //  url: "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?" + $.param(params),
                url: "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?",
                beforeSend: function(xhrObj) {
                    // Request headers
                    //  xhrObj.setRequestHeader("Content-Type","application/json");
                    xhrObj.setRequestHeader("Content-Type", "application/octet-stream");

                    // NOTE: Replace the "Ocp-Apim-Subscription-Key" value with a valid subscription key.
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", key_1);
                },
                processData: false,
                type: "POST",
                // Request body
                data: imgblob,
            })
            .done(function(data) {
                typeof okcallback === 'function' && okcallback(data);
            })
            .fail(function(error) {
                typeof errcallback === 'function' && errcallback(error);
            });
    }
})
