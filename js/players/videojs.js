var videoPlayer, me;
var userName = $.cookie('userName') || "guest";
var UPDATE_INTERVAL = 1;  // seconds

// this global variable is used to differentiate between user triggered events  
// from events that are triggered from Firebase 
var userStateChange = true;

function getType(url) {
    var parsed = document.createElement("a");
    parsed.href = url;

    tokens = parsed.pathname.split(".");
    extension = tokens[tokens.length-1];
    return "video/" + extension;
}

videoRef.once("value", function(snapshot) {
    videoInfo = snapshot.val();
    $(document).ready(function() {
        videoPlayer = videojs("player");
        videoPlayer.src({
            type: getType(videoInfo.url),
            src: videoInfo.url
        });

        // add ourselves
        me = videoRef.child("people").push({"name": userName});
        me.onDisconnect().remove();
        var lastUpdate = new Date().getTime();
        videoPlayer.on("timeupdate", function() {
            now = new Date().getTime();
            if ((now - lastUpdate) > UPDATE_INTERVAL*1000) {
                lastUpdate = now;
                me.update({"currentTime": videoPlayer.currentTime()});
            }
        });

        // send events
        function sendEvent(eventType) {
            if (!userStateChange) {
                userStateChange = true;
                return;
            }

            // get current position
            position = videoPlayer.currentTime() || 0;
            console.log("SEND: " + eventType + " (" + position + ")");                           

            // send event
            videoRef.child("status").update(                                        
                {"action": eventType, "position": position, "name": me.name()});       
        }
        videoPlayer.on("play", function() { sendEvent("play"); });
        videoPlayer.on("pause", function() { sendEvent("pause"); });

        // go to the current time
        videoRef.child("people").once("value", function(snapshot) {
            // calculate average play time
            currentTime = 0, n = 0;
            videoRef.child("people").once("value", function(snapshot) {
                snapshot.forEach(function(person) {
                    currentTime += person.val().currentTime || 0;
                    n + 1;
                });
                currentTime = n > 0 ? currentTime / n : 0;
                console.log("Seeking to: " + currentTime);
                videoPlayer.currentTime(currentTime);
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
                    videoPlayer.currentTime(position);

                    // and change state
                    userStateChange = false;
                    if (action == "play") {
                        videoPlayer.play();
                    } else if (action == "pause") {
                        videoPlayer.pause();
                    }
                    // if we're paused and we get a pause event we need to 
                    // change the variable back; same for pause I'd guess...
                    userStateChange = true;
                }
            });
        });
    });
});
