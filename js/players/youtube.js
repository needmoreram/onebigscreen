// http://apiblog.youtube.com/2011/01/introducing-javascript-player-api-for.html
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var videoPlayer, me;
var userName = $.cookie('userName') || "guest"; 

// this global variable is used to differentiate between user triggered events
// from events that are triggered from Firebase
var userStateChange = true;

var UPDATE_INTERVAL = 1;  // seconds

function onYouTubeIframeAPIReady() {
    videoRef.once("value", function(snapshot) {
        videoInfo = snapshot.val();

        // parse the id from video URL
        parsed = document.createElement("a");
        url = videoInfo.url;
        parsed.href = url;
        var videoId = /\?v=(.+)/.exec(parsed.search)[1];

        videoPlayer = new YT.Player('player', {
            height: '400',
            width: '100%',
            videoId: videoId,
            events: {
                "onStateChange": onPlayerStateChange,
                "onReady": onPlayerReady
            }
        });
    });
}

function onPlayerReady(event) {
    /* Play/pause video when player is ready.
     *
     * When the player is ready we check the current status and start playing
     * or keep the video paused, as necessary.
     */
    // add ourselves
    me = videoRef.child("people").push({"name": userName}); 
    me.onDisconnect().remove();
    setInterval(function() {
        me.update({"currentTime": videoPlayer.getCurrentTime()});
    }, UPDATE_INTERVAL*1000);

    // got to current time
    videoRef.child("people").once("value", function(snapshot) {
        // calculate average play time
        currentTime = 0, n = 0;
        videoRef.child("people").once("value", function(snapshot) {
            snapshot.forEach(function(person) {
                currentTime += person.val().currentTime || 0;
                n += 1;
            });
            currentTime = n > 0 ? currentTime / n : 0;
            console.log("Seeking to: " + currentTime);
            videoPlayer.seekTo(currentTime, true);
        });

        // receive play/pause events
        videoRef.child("status").on("value", function(snapshot) {
            action = snapshot.child("action").val();
            position = snapshot.child("position").val();
            name = snapshot.child("name").val();
            console.log("RECEIVE: " + action + "(" + position + ")");
            if (name != me.name()) {
                // seek to the position
                userStateChange = false;
                videoPlayer.seekTo(position, true);

                // and change state
                userStateChange = false;
                if (action == "play") {
                    videoPlayer.playVideo();
                } else if (action == "pause") {
                    videoPlayer.pauseVideo();
                }
            }
        });
    });
}

function onPlayerStateChange(event) {
    /* Capture player events and publish to Firebase.
     *
     * We must distinguish from events that were fired by the user from events
     * that are triggered from other events -- ie, if the player pauses because
     * we received a pause event we don't want to publish a second pause event.
     */
    if (!userStateChange) {
        userStateChange = true;
        return;
    }

    // get current position
    position = videoPlayer.getCurrentTime() || 0;

    if (event.data == YT.PlayerState.PLAYING) {
        console.log("SEND: play (" + position + ")");
        videoRef.child("status").update(
            {"action": "play", "position": position, "name": me.name()});
    } else if (event.data == YT.PlayerState.PAUSED) {
        console.log("SEND: pause (" + position + ")");
        videoRef.child("status").update(
            {"action": "pause", "position": position, "name": me.name()});
    }
}
