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
		socket.on("message", (data) => {
			io.sockets.emit("message", data);
		});
	});
});
