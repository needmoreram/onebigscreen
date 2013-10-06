var oneBigChat = oneBigChat || {};
oneBigChat.urlBase = new Firebase('https://obs.firebaseio.com/videos/');

/*global window, $, Handlebars, nomen: true*/
oneBigChat.appOpened = function(videoId) {
	oneBigChat.videoId = videoId;
	console.log("The videoId is: " + videoId + "."); 
	oneBigChat.initChatroom(videoId); 
}	

oneBigChat.initChatroom = function(videoId){ 
	console.log(videoId); 
	if(!videoId)
	{
		videoId = "default";
	}
	// Get a reference to the root of the chat data.
	oneBigChat.messagesRef = new Firebase(oneBigChat.urlBase + videoId + "/chat");
	oneBigChat.usersRef = new Firebase('https://8ozshort.firebaseIO.com/users');
	// When the user presses enter on the message input, write the message to firebase.
	$('#messageInput').keypress(function (e) {
		oneBigChat.UpdateFireBase(e);
	});
	// Add a callback that is triggered for each chat message.
	oneBigChat.messagesRef.on('child_added', function (snapshot) {
		var message = snapshot.val();
		$('<div/>').text(message.text).prepend($('<em/>')
		.text(message.name+': ')).appendTo($('#messagesDiv'));
		$('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
		});
}

oneBigChat.UpdateFireBase = function(e){
		if (e.keyCode == 13) {
			var name = $('#nameInput').val();
			var text = $('#messageInput').val();
			oneBigChat.messagesRef.push({name:name, text:text});
			$('#messageInput').val('');
		}
}

oneBigChat.changeChatRoom = function (name) { 
	oneBigChat.messagesRef = new Firebase('https://8ozshort.firebaseIO.com/'+name);
	oneBigChat.messagesRef.on('child_added', function (snapshot) {
		var message = snapshot.val();
		$('<div/>').text(message.text).prepend($('<em/>')
		.text(message.name+': ')).appendTo($('#messagesDiv'));
		$('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
		});
}
