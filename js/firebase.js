function getParameterByName(name) {                                             
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");                
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),                      
        results = regex.exec(location.search);                                  
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}   

var fb = new Firebase("https://obs.firebaseio.com/");
var id = getParameterByName("id");
var videoRef = fb.child("videos").child(id);
