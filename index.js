var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/static"));

app.set("port", (process.env.PORT || 5000));

app.get("/", function(req, res, next) {
    res.sendFile(__dirname + req);
});

app.listen(app.get("port"), function() {
	console.log('Node app is up and running on port', app.get('port'));
});
