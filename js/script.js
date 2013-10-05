if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", init, false);
} else {
    window.onload = init;
}

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

function announceMyPresence() {
    myName = "Guest";
    console.log();
}
