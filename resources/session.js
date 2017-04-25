/*
** session.js
*/

const user = require("./user");

module.exports = {
	init: function(instance) {
		this.sessions = {
			"main": {	/* The default group */
				users: {	/* Just some sockets that you can send data to. Instead of sending to all connected users we just send to this group of users. */
					/* id: socket */
				}	
			}
		}
		session = this;
		this.instance = instance;
		this.users = {}
		this.name = "";

		this.sendAllGroup = function(socket, command, data) {
			var currentUser = session.users[socket.id];
			var currentSession = currentUser.session;

			if (session.sessions[currentSession]) {
				for (var i in session.sessions[currentSession].users) {
					if (session.sessions[currentSession].users[i]) {
						session.sessions[currentSession].users[i].emit(command, 
							{name: currentUser.name, text: data}
						);
					}
				}
			}
		}

		this.instance.io.on("connect", function(socket) {
			console.log("User connected");

			session.users[socket.id] = new user.init(instance, session, socket);

			socket.on("newSession", function(data) {
				var currentSession = session.users[socket.id].session;
				if (currentSession != "")	{	/* If already connected to a group then disconnect from it */
					delete session.sessions[currentSession].users[socket.id];
				}
				var id = socket.id;
				if (!session.sessions[data]) {
					session.sessions[data] = {
						users: {	/* socket.id => socket */}
					}
					session.sessions[data].users[socket.id] = socket;
					session.users[socket.id].session = data;
				} else {
					socket.emit("changeView", "");
				}
				
			});

			socket.on("join", function(data) {
				if (session.sessions[data] != null) {
					session.sessions[data].users[socket.id] = socket;
					session.users[socket.id].session = data;
					session.sendAllGroup(socket, "alert", "Has connected to the chat");
				} else {
					socket.emit("changeView", "");	/* Maybe create a notice popup */
				}
			});

			socket.on("joinRandom", function() {
				socket.emit("changeView", "");
			});

			socket.on("message", function(data) {
				session.sendAllGroup(socket, "message", data);
			});

			socket.on("name", function(data) {
				session.sendAllGroup(socket, "alert", "Changed name to " + data);
				session.users[socket.id].name = data;
			});

			socket.on("disconnect", function() {
				session.sendAllGroup(socket, "alert", "Has disconnected");
				console.log("User has disconnected");
				if (session.users[socket.id] != null) {
					delete session.users[socket.id];
				}
			})
		});
	}
}