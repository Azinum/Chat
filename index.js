var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/static"));

app.get("/", function(req, res, next) {
    res.sendFile(__dirname + req);
});

server.listen(8080);