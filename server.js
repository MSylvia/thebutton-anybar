var anybar          = require('anybar');
var app             = require('http').createServer()
var WebSocketClient = require('websocket').client;
var XMLHttpRequest  = require("xmlhttprequest").XMLHttpRequest;

var log = false;

function colorFromSecondsRemaining(seconds)
{
    var i = parseInt(seconds);

         if (i > 51) return "purple";
    else if (i > 41) return "blue";
    else if (i > 31) return "green";
    else if (i > 21) return "yellow";
    else if (i > 11) return "orange";
    else             return "red";
}

function setAnybar(timeRemaining)
{
    var color = colorFromSecondsRemaining(timeRemaining);
    if(log) console.log("Setting lights to " + color);

    anybar(color);
}

// From Jamesrom's cool button visualizer:
// https://github.com/jamesrom/jamesrom.github.io/blob/master/comms.js
var Comms = (function() {
    var self = {};
    var sock;

    anybar('question');

    var redditRequester = new XMLHttpRequest();

    redditRequester.onreadystatechange = function () {
        if (redditRequester.readyState !== 4) {
            return;
        }
        var websocketURL;
        if (redditRequester.status === 200) {
            var regex = /"(wss:\/\/wss\.redditmedia\.com\/thebutton\?h=[^"]*)"/g;
            websocketURL = regex.exec(redditRequester.responseText)[1];
        }

        websocketURL = websocketURL || "wss://wss.redditmedia.com/thebutton?h=7f66bf82878e6151f7688ead7085eb63a0baff0b&e=1428621271";

        console.log("Connecting to: " + websocketURL);
        var client = new WebSocketClient();

        client.on('connect', function(connection) {
            connection.on('message', tick);
            console.log('Connected');
        });

        client.connect(websocketURL);
    };

    // Use CORS proxy by lezed1 to get the Reddit homepage!
    redditRequester.open("get", "http://cors-unblocker.herokuapp.com/get?url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fthebutton", true);
    redditRequester.send();

    function tick(evt) {
        var packet = JSON.parse(evt.utf8Data);

        if(log) console.log(packet.payload.seconds_left + "s");
        setAnybar(packet.payload.seconds_left);
    }

    return self;
}())