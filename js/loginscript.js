
var processLogin = function (error, user) {
        if (error) {
            console.log(error);
        }
        if (user) {
            $.cookie('firebaseAuthToken', user.firebaseAuthToken);
            $.cookie('facebookAuthToken', user.accessToken);
            curruser = { id: user.id,
                fullName: user.name,
                firstName: user.first_name,
                lastName: user.last_name
            };
            displayUser();
        }
    }

    var displayUser = function () {
        //$("h3").text('Hi, ' + curruser.fullName);
        $("#greeting").html("Hi, " + curruser.fullName);
    }

    var loginUser = function () {
        auth.login('facebook', {
            rememberMe: true,
            scope: 'email,read_friendlists'
        });
    }
    var logoutUser = function () {
        $.removeCookie('firebaseAuthToken');
        $.removeCookie('facebookAuthToken');
        auth.logout();
        authRef.unauth();
        //$("h3").text('One Big Screen');
        $("#greeting").html("");
    }

    var getCurrentUser = function (callback) {
        if (!$.cookie('firebaseAuthToken') || !$.cookie('facebookAuthToken')) {
            callback.onComplete();
            return;
        }
        authRef.auth($.cookie('firebaseAuthToken'), function (error, result) {
            if (error) {
                callback.onError(error);
            }
            else {
                if (result != null) {
                    $.ajax({
                        url: 'https://graph.facebook.com/me?access_token=' + $.cookie('facebookAuthToken')
                    }).done(function (data) {
                        callback.onComplete({
                            id: data.id,
                            fullName: data.name,
                            firstName: data.first_name,
                            lastName: data.last_name
                        });
                        //callback.onComplete(data);
                    });
                }
            }
        });
    }
