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

function publishEvent(eventType) {
	console.log("Sending event: " + eventType);
    videoRef.update({"status": eventType});
}

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
        videoPlayer.on("play", function() { publishEvent("play") });
        videoPlayer.on("pause", function() { publishEvent("pause") });
		
		var people = videoRef.child('people');
		var numPeople = 0;
		var me, myName, myTime = 0;
		
        // Average the time of all participants and start there
		people.once("value", function(snapshot) {
			var everyone = snapshot.val();
			numPeople = everyone.length;
			for (i = 0; i < numPeople; i ++) {
				console.log(everyone[i] + " is in this room");
				myTime += everyone[i].currentTime;
			}
			if (numPeople)
				myTime = myTime / numPeople;
		});
		/* people.on("child_added", function(snapshot) {
			console.log(snapshot.name + " is in this room");
			numPeople ++;
		}); */
		
		// Add yourself to the people list
		myName = prompt("Your name?"); // XXX TODO Sanitize
		console.log("Welcome " + myName);
		me = people.child(myName);
		me.set({ "currentTime": myTime });
		
		// Setup disconnect callbacks
		me.onDisconnect().remove();
		
        var lastUpdate = new Date().getTime();
        videoPlayer.on("timeupdate", function() {
            now = new Date().getTime();
            if ((now - lastUpdate) > 1000) {
                lastUpdate = now;
                me.update({ "currentTime": myTime });
            }
        });
		
        // set up remote events
        videoRef.child("status").on("value", function(snapshot) {
            console.log("Received event: " + snapshot.val());
            status = snapshot.val();
            if (status === "play") {
                videoPlayer.play();
            } else if (status == "pause") {
                videoPlayer.pause();
            }
        });
    });
});
