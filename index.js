var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/static"));

app.set("port", (process.env.PORT || 5000));

app.get("/", (req, res, next) => {
    res.sendFile(__dirname + req);
});

server.listen(app.get("port"), () => {
	console.log('Node app is up and running on port', app.get('port'));

	io.on("connect", (socket) => {
		var session = {
			name: "Unknown"
		}
		socket.on("message", (data) => {
			if (data[0] == "/") {	/* Okay, message is a command */
				data = data.split(" ");
				switch (data[0]) {
					case "/name": {
						if (data.length < 30) {
							io.sockets.emit("alert", {text: session.name + " changed name to " + data[1]})
							session.name = data[1];
						}
						return;
					}
					default:
						break;
				}
			}
			io.sockets.emit("message", {name: session.name, text: data});
		});
	});
});
