var fb = new Firebase("https://obs.firebaseio.com/");
var videoInfo, videoPlayer;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getType(filepath) {
    tokens = filepath.split(".");
    extension = tokens[tokens.length-1];
    return "video/" + extension;
}

var id = getParameterByName("id");
var videoRef = fb.child("videos").child(id);

// XXX TODO create a new participant
videoRef.once("value", function(snapshot) {
    videoInfo = snapshot.val();
    $(document).ready(function() {
        videoPlayer = videojs("mvp");
        videoPlayer.src({
            type: getType(videoInfo.url),
            src: videoInfo.url,
        });

        // set up local events
        var publishEvent = function(eventType) {
            videoRef.update({"status": eventType});
            console.log("Sending event: " + eventType);
        };
        videoPlayer.on("play", function() {publishEvent("play")});
        videoPlayer.on("pause", function() {publishEvent("pause")});
        var lastUpdate = new Date();
        videoPlayer.on("timeupdate", function() {
            now = new Date();
            if ((now - lastUpdate) > 1000) {
                lastUpdate = now;
                // XXX TODO 
                // update participant currentTime
            }
        });

        // set up remote events
        statusRef = videoRef.child("status");
        statusRef.on("value", function(snapshot) {
            console.log("Received event: " + snapshot.val());
            status = snapshot.val();
            if (status === "play") {
                videoPlayer.play();
            } else if (status == "pause") {
                videoPlayer.pause();
            }
        });

        // start playing?
        // XXX TODO compare to average currentTime of all participants
        videoPlayer.currentTime(videoInfo.currentTime || 0);
        if (videoInfo.status === "play") {
            videoPlayer.play();
        }
    });
});
