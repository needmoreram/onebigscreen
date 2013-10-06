var users = [];
chatRef = videoRef.child("chat");

function drawPresenceBar() {
    $("#users").find("dd").remove();
    for (var i=0; i<users.length; i++) {
        $("#users").append("<dd>" + users[i] + "</dd>");
    }
}

videoRef.child("people").on("child_added", function(snapshot) {
    users.push(snapshot.val().name);
    drawPresenceBar();
})
videoRef.child("people").on("child_removed", function(snapshot) {
    var i = users.indexOf(snapshot.val().name);
    users.pop(i);
    drawPresenceBar();
});

function process(message) {
    if (message.indexOf("/alias") == 0) {
        userName = /\/alias (.+)/.exec(message)[1];
        me.update({"name": userName});
        $.cookie("userName", userName);
    }
}

// send message when Enter or button are pressed
function sendMessage() {
    var message = $("#userMessage").val();
    if (message.charAt(0) == "/") {
        process(message);
    } else {
        chatRef.push({"name": userName, "text": message});
    }
    $("#userMessage").val("");
}
$("#userMessage").keypress(function(event) {
    if (event.keyCode == 13) {
        sendMessage();
    }
});
$("#sendMessage").click(function(event) {
    sendMessage();
});

chatRef.on("child_added", function(snapshot) {
    var name = snapshot.val().name;
    var text = snapshot.val().text;
    $("#messages").append("<li><b>" + name + "</b>: " + text + "</li>");
    $("#chat")[0].scrollTop = $("#chat")[0].scrollHeight;
});
