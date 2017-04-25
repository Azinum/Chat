/*
** uchat.js
*/

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const helmet = require("helmet");

const config = require("./config");
const session = require("./session").init;

module.exports = {
	init: function() {

		app.use(express.static(config.staticPath));

		app.use(helmet());

		app.set("port", (process.env.PORT || config.port));
		
		app.use(express.static("../" + __dirname + "/static"));

		app.get("/", function(req, res, next) {
		    res.sendFile(__dirname + req);
		});
		
		server.listen(app.get("port"), function() {
			console.log("Server running on port", app.get("port"));
		});
	},
	run: function() {
		var instance = this;
		this.io = io;
		this.session = session;
		var rootSession = new session(this);
	}
};