/*
** user.js
*/

module.exports = {
	init: function(instance, session, socket) {
		this.name = "Unknown";
		this.uid = "";
		this.session = "";
		this.rank = 1;
		this.sock = socket;
		this.id = socket.id;
	}
}