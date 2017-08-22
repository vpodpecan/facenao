//
// NOTE: this code is adapted from the AirNAO application: https://cloud.aldebaran-robotics.com/application/airnao/
//        created by Jérôme Millet and Laurent Lec.

var jsnao = {
  sname : null,
  session : null,
  al_sys : null,
  al_tts : null,
  al_atts: null,
  al_posture : null,
  al_player : null,
  log_listener : null,
  error : function(data) { console.log(data) },
  connect : function(address, infocb) {
    console.log('Create Session to : '+address);
    jsnao.session = new QiSession(address);
    jsnao.session.socket().on('connect', jsnao.connected);
    jsnao.session.socket().on('disconnect', jsnao.disconnected);
  },
  connected : function() {
    console.log('Session Connected.');
    jsnao.session.service("ALSystem").done(jsnao.init_system);
    jsnao.session.service("ALTextToSpeech").done(jsnao.init_tts);
    jsnao.session.service("ALAnimatedSpeech").done(jsnao.init_atts);
    jsnao.session.service("ALRobotPosture").done(jsnao.init_posture);
    jsnao.session.service("ALAudioPlayer").done(jsnao.init_player);
    jsnao.session.service("ALMotion").done(jsnao.init_motion);
    jsnao.session.service("ALVideoDevice").done(jsnao.init_video);
  },
  init_tts : function(data) {
    jsnao.al_tts = data;
    console.log('Text To Speech Initialized.');
  },
  init_atts : function(data) {
    jsnao.al_atts = data;
    console.log('Animated Text To Speech Initialized.');
  },
  init_system : function(data) {
    jsnao.al_sys = data;
    console.log('System Initialized.');
  },
  init_posture : function(data) {
    jsnao.al_posture = data;
    console.log('Posture Initialized.');
  },
  init_player : function(data) {
    jsnao.al_player = data;
    console.log('Player Initialized.');
  },
  init_motion : function(data) {
    jsnao.al_motion = data;
    console.log('Motion Initialized.');
  },
  init_video : function(data) {
    jsnao.al_video = data;
    console.log('Video Initialized.');
  },
  disconnected : function() {
    console.log('Session Disconnected.');
  },
}
