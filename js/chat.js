var proxyChat = proxyChat || {};
proxyChat.usersRef = new Firebase('https://8ozshort.firebaseIO.com/users');
proxyChat.messagesRef = new Firebase('https://8ozshort.firebaseIO.com/default');

/*global window, $, Handlebars, nomen: true*/
proxyChat.appOpened = function() {
	proxyChat.initChatroom(); 
	proxyChat.initMap(); 
}	

proxyChat.changeMapLocation = function(location){
	map = L.map('map').setView([51.505, -0.09], 13);
}

proxyChat.UpdateFireBase = function(e){
		if (e.keyCode == 13) {
			var name = $('#nameInput').val();
			var text = $('#messageInput').val();
			proxyChat.messagesRef.push({name:name, text:text});
			$('#messageInput').val('');

			proxyChat.usersRef.push({
				name:name, 
				timestamp: new Date().getTime()
			})
		}
}
proxyChat.initChatroom = function(chatroom){
	if(!chatroom)
		{chatroom = "default";}
	// Get a reference to the root of the chat data.
	proxyChat.messagesRef = new Firebase('https://8ozshort.firebaseIO.com/'+chatroom);
	proxyChat.usersRef = new Firebase('https://8ozshort.firebaseIO.com/users');
	// When the user presses enter on the message input, write the message to firebase.
	$('#messageInput').keypress(function (e) {
		proxyChat.UpdateFireBase(e);
	});
	// Add a callback that is triggered for each chat message.
	proxyChat.messagesRef.on('child_added', function (snapshot) {
		var message = snapshot.val();
		$('<div/>').text(message.text).prepend($('<em/>')
		.text(message.name+': ')).appendTo($('#messagesDiv'));
		$('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
		});

	var name = $('#nameInput').val();
	var me = proxyChat.usersRef.push({
		name:name, 
		timestamp: new Date().getTime()
	});
}
proxyChat.loadChatroomsOnMap = function(chatroom){
	var chatrooms, 
		nestChat, 
		hackChat, 
		StanfordChat, 
		parkChat; 

	nestChat = {name: "NestGsv",
				 lat: 37.484359800256485, 
				 lng: -122.20283746719359,
				description: "nestGSV’s flagship campus is generously stocked and strategically situated in the heart of Silicon Valley"};
	hackChat = {name: "CollabHack13",
				 lat: 37.48441088148189, lng: -122.20330953598021,
				 description:"Hacking, all day, all night"};
	StanfordChat = {name: "StanfordSleep",
				 lat: 37.485960328721816, 
				 lng: -122.20223665237428,
				  description:"Zzzzzzzzzzzzzz...."};
	parkChat = {name: "andrewSpinas",
				 lat: 37.48390006765626, 
				 lng: -122.20116376876831,
				 description: "Playing Fisbee looking for more!"};
	proxyChat.placeExistingMarker(nestChat.name, nestChat.description, nestChat.lat, nestChat.lng); 
	proxyChat.placeExistingMarker(hackChat.name, hackChat.description, hackChat.lat, hackChat.lng); 
	proxyChat.placeExistingMarker(StanfordChat.name, StanfordChat.description, StanfordChat.lat, StanfordChat.lng); 
	proxyChat.placeExistingMarker(parkChat.name, parkChat.description, parkChat.lat, parkChat.lng);  
}

proxyChat.setMapLocationToLondon = function(){
	map = L.map('map').setView([51.505, -0.09], 13);
}
proxyChat.initMap = function(location){
	// set up the map
	map = L.map('map');
	proxyChat.setMapToCurrentPostion(); 
	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='proxyChat <3\'s leaflet';
	var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 18, attribution: osmAttrib});       
	map.addLayer(osm);
	map.on('click', proxyChat.onMapClick);
	proxyChat.loadChatroomsOnMap();
}

proxyChat.OpenStreetMapTileLayer = function(){
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
}

proxyChat.setMapToCurrentPostion = function() {
		if (!navigator.geolocation) 
			return false; 
		else{
		navigator.geolocation.getCurrentPosition(proxyChat.showPosition);	
		map.se
	}
}

proxyChat.showPosition = function(position) {
	map.setView([51.505, -0.09], 16);
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;

	map.setView(new L.LatLng(latitude, longitude), 16);
}

proxyChat.onMapClick = function(e) {
	//proxyChat.placePopup(e.latlng); 
	proxyChat.placeMarker(e.latlng.lat, e.latlng.lng); 
}
proxyChat.placePopup = function(latlng){
var popup = L.popup();
    popup
        .setLatLng(latlng)
        .setContent("You clicked the map at " + latlng.toString())
        .openOn(map);
		var popup = L.popup();
}

proxyChat.placeMarker = function (lattitude, longitude) {
	var marker = L.marker([lattitude, longitude])
	marker.bindPopup(proxyChat.generateNewPopupText()).openPopup();
	marker.addTo(map);
}
proxyChat.placeExistingMarker = function (name, description, lattitude, longitude) {
	var marker = L.marker([lattitude, longitude])
	marker.on('click', function () {
            proxyChat.changeChatRoom(name);
            $('#messagesDiv').empty(); 
            marker.openPopup();
        });
	marker.bindPopup(proxyChat.generateExistingPopupText(name, description)).openPopup();
	marker.addTo(map);
}
proxyChat.changeChatRoom = function (name) { 
	proxyChat.messagesRef = new Firebase('https://8ozshort.firebaseIO.com/'+name);
	proxyChat.messagesRef.on('child_added', function (snapshot) {
		var message = snapshot.val();
		$('<div/>').text(message.text).prepend($('<em/>')
		.text(message.name+': ')).appendTo($('#messagesDiv'));
		$('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
		});
}

proxyChat.placeCircle = function (lattitude, longitude) {
	var marker = L.marker([lattitude, longitude])
	marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
	marker.addTo(map);
}
proxyChat.placePolygon = function (lattitude, longitude) {
	
}	
function SwitchChatRoom(chatName){

}
proxyChat.generateExistingPopupText = function (name, description) {
    'use strict';
    var source, template, context, html;
    source   = $("#chatPopup").html();
    template = Handlebars.compile(source);
    context = {chatName: name, chatDescription: description};
    html    = template(context);
    return html;
}
proxyChat.generateNewPopupText = function (description) {
    'use strict';
    var source, template, context, html;
    source   = $("#newChatPopup").html();
    template = Handlebars.compile(source);
    context = {chatName: name, chatDescription: description};
    html    = template(context);
    return html;
}