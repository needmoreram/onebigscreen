var fb = new Firebase("https://obs.firebaseio.com/");
var videoInfo;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function() {
    var id = getParameterByName("id");
    console.log(id);
    var videoRef = fb.child("videos").child(id);
    fb.once("value", function(snapshot) {
        videoInfo = snapshot.val();
        console.log(videoInfo.url);
    });
});

if (false) {
var fb = new Firebase("https://wesync.firebaseio.com/");
var fbv = fb.child('videos').child('0'); // TODO: Don't hardcode video id
var people = fbv.child('people');

var cdn_url, vinfo;
var need_sync = 0;

var myPlayer;
var myName;
var myTime;

var tu_counter = 0;

fb.child('content').once('value', function(snapshot) {
    cdn_url = snapshot.val().direct; // TODO: change to CDN
});

fbv.once('value', function(snapshot) {
    vinfo = snapshot.val();
    console.log("fetched video info");
    initVideo();
});

function init() {
    console.log("init");
    myPlayer = videojs("mvp");
    myPlayer.on("play", function() {
        if (need_sync) {
            myPlayer.currentTime(vinfo.current_time);
            need_sync = 0;
        }
		
    });
    /* myPlayer.on("timeupdate", function(t){
        console.log(t);
    }); */
    announceMyPresence();
}

function initVideo() {
    if (!myPlayer) {
        setTimeout(initVideo, 1000);
        return;
    }
    if (vinfo) {
        myPlayer.src([
            { type: "video/mp4", src: cdn_url + vinfo.url.mp4 },
            { type: "video/webm", src: cdn_url + vinfo.url.webm }
        ]);
        need_sync = 1;
        if (vinfo.status == "play")
            myPlayer.play();
    }
}

/* Should we use .info/connected for announcing presence instead? */
function announceMyPresence() {
    myName = "Guest";
    people.push();
}
}
