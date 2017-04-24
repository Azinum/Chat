var app = angular.module("App", [])
.controller("main", function($scope) {

	$scope.userInput = "";
	$scope.messages = [];
	$scope.socket = io();

	$scope.socket.on("message", (data) => {
		$scope.messages.push(data);
	});

	$scope.$watch("messages", () => {
		setInterval(() => {
			$scope.$apply();
			return;
		}, 0);
	});

	$scope.sendMessage = () => {
		console.log($scope.userInput);
		$scope.socket.emit("message", $scope.userInput);
		$scope.userInput = "";
	}
})
.filter("reverse", function() {
	return function(messages) {
		return messages.slice().reverse();
	}
})