/*
** session.js
*/

const user = require("./user");


function getTime() {
	date = new Date();
	return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

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

		this.getCurrentUser = function(socket) {
			if (session.users[socket.id]) {
				return session.users[socket.id];
			}
			console.log("This user does not exist... Socket:", socket.id);
			return null;
		}

		this.sendAllGroup = function(socket, command, value) {
			var currentUser = session.users[socket.id];
			var currentSession = currentUser.session;

			if (session.sessions[currentSession]) {
				for (var i in session.sessions[currentSession].users) {
					if (session.sessions[currentSession].users[i]) {
						session.sessions[currentSession].users[i].emit(command, value);
					}
				}
			}
		}

		setInterval(function() {
			session.instance.io.sockets.emit("setValue", {
				key: "userCount",
				value: Object.keys(session.users).length
			});
		}, 1000 * 4);

		this.instance.io.on("connect", function(socket) {
			session.users[socket.id] = new user.init(instance, session, socket);
			var currentUser = session.getCurrentUser(socket);

			socket.on("newSession", function(data) {
				var currentSession = session.users[socket.id].session;
				if (currentSession != "")	{	/* If already connected to a group then disconnect from it */
					delete session.sessions[currentSession].users[socket.id];
				}
				var id = socket.id;
				if (!session.sessions[data]) {
					session.sessions[data] = {
						users: {	/* socket.id: socket */}
					}
					session.sessions[data].users[socket.id] = socket;
					session.getCurrentUser(socket).session = data;
				} else {
					socket.emit("changeView", "");
				}
				
			});

			socket.on("join", function(data) {
				if (session.sessions[data] != null) {
					session.sessions[data].users[socket.id] = socket;
					session.getCurrentUser(socket).session = data;
					
					session.sendAllGroup(socket, "message", {
						name: session.users[socket.id].name,
						data: {
							text: "Has connected to the chat",
							style: "alert"
						}
					});
				} else {
					socket.emit("changeView", "");	/* Maybe create a notice popup */
				}
			});

			socket.on("joinRandom", function() {
				var chatRoomCount = Object.keys(session.sessions).length;
				var randomRoom = Math.floor(Math.random() * chatRoomCount);
				var roomName = Object.keys(session.sessions)[randomRoom];
				var room = session.sessions[roomName];
				
				if (room != null) {
					room.users[socket.id] = socket;
					session.getCurrentUser(socket).session = roomName;
					
					session.sendAllGroup(socket, "message", {
						name: session.users[socket.id].name,
						data: {
							text: "Has connected to the chat",
							style: "alert"
						}
					});
				} else {
					socket.emit("changeView", "");
				}
			});

			socket.on("message", function(message) {
				var currentUser = session.getCurrentUser(socket);
				
				session.sendAllGroup(socket, "message", {
					name: currentUser.name,
					data: {
						text: message,
						style: "normal"
					},
					time: getTime()
				});
			});

			socket.on("name", function(message) {
				session.sendAllGroup(socket, "message", {
					name: session.getCurrentUser(socket).name,
					data: {
						text: message,
						style: "alert"
					},
					time: getTime()
				});
				session.users[socket.id].name = message;
			});

			socket.on("disconnect", function() {
				session.sendAllGroup(socket, "message", {
					name: session.getCurrentUser(socket).name,
					data: {
						text: "Has disconnected",
						style: "alert"
					}
				});
				if (session.users[socket.id] != null) {
					delete session.users[socket.id];
				}
			})
		});
	}
}