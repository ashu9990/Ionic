angular.module('app.services', [])

.factory ('RegisterService', function ($localStorage) {
	$localStorage.things = {};
	$localStorage.things.users=[];
	$localStorage.things.profile=[];
	$localStorage = $localStorage.$default({
  		things: {}
	});
	var _getAll = function () {
  		return $localStorage.things;
	};

	var _getUser = function () {
  		return $localStorage.things.users;
	};

	var _add = function (thing) {
  		$localStorage.things.users.push(thing);
	};
    
    var _update = function(thing){
        for (var i=0;i<$localStorage.things.users.length;i++){
            if (thing.emailId == $localStorage.things.users[i].emailId){
                $localStorage.things.users[i].password = thing.password;
            }
        }
    };

	var _remove = function (thing) {
  		$localStorage.things.users.splice($localStorage.things.users.indexOf(thing), 1);
	};

	return {
    	getAll: _getAll,
    	add: _add,
    	remove: _remove,
    	getUser: _getUser,
        update: _update
  	};
})

.factory('ProfileService',function($localStorage){
	$localStorage.things.profile=[];
	$localStorage = $localStorage.$default({
  		things: {}
	});
    
    var _getAll = function () {
  		return $localStorage;
	};
    
	var _getProfile = function () {
  		return $localStorage.things.profile;
	};

	var _add = function (thing) {
  		$localStorage.things.profile.push(thing);
	};

	var _remove = function (thing) {
  		$localStorage.things.profile.splice($localStorage.things.profile.indexOf(thing), 1);
	};

	return {
    	add: _add,
    	remove: _remove,
    	getProfile: _getProfile,
        getAll: _getAll
  	};
})


.factory('AuthenticationService' ,function (Base64, $http, $rootScope, $timeout,$state,$localStorage) {
        var service = {};
        var loggedIn = false;
        var loggedUser = [];
        service.Login = function (username, password, callback) {
        	var response={}
        	/* Dummy authentication for testing, uses $timeout to simulate api call*/
        	$timeout(function(){
	        	for (var i=0;i<$localStorage.things.users.length;i++){
	                if (username == $localStorage.things.users[i].email){
	                    loggedUser.push($localStorage.things.users[i])
	                }
	            }
	            if (loggedUser.length){
		            response = { success: username === loggedUser[0].email && password === loggedUser[0].password };
		            if(!response.success) {
	                    response.message = 'Password is incorrect!';
	                } else {
	                	response.Obj=loggedUser[0];
	                }
	            } else {
	            	response.message="Email Id not registered!";
	            }
                callback(response);
            }, 1000);
            /* Use this for real authentication
             ----------------------------------------------*/
            // $http.post('/api/authenticate', { username: username, password: password })
            //    .success(function (response) {
            //        callback(response);
            //    });
        };

        service.SetCredentials = function (username, password,response) {
            var authdata = Base64.encode(username + ':' + password);
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: authdata
                },
                Obj:response
            };
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $localStorage.cookies = $rootScope.globals;
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            if ($localStorage.cookies){
	            delete $localStorage.cookies;
	        }
            $http.defaults.headers.common.Authorization = 'Basic ';
            $state.go('app.login');
        };
    
        service.resetPass = function (username,callback) {
        	var response={}
            $timeout(function(){
                if ($localStorage.things.users.length){
                    for (var i=0;i<$localStorage.things.users.length;i++){
                        if (username == $localStorage.things.users[i].email){
                            loggedUser.push($localStorage.things.users[i])
                        }
                    }
                    if (loggedUser.length){
                        response = { success: username === loggedUser[0].email};
                        if(response.success) {
                           response.Obj=loggedUser[0];
                        }
                    } else {
	                   response.message = 'Email Id is not registered!';
	                }
                }
                callback(response);
            }, 1000);
        };
  
        return service;
    })
  
.factory('Base64', function () {
    /* jshint ignore:start */
  
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
  
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
  
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
  
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
  
            return output;
        },
  
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
  
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
  
                output = output + String.fromCharCode(chr1);
  
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
  
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
  
            } while (i < input.length);
  
            return output;
        }
    };
});