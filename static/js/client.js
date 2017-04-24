var app = angular.module("App", [])
.controller("main", function($scope) {

	$scope.userInput = "";
	$scope.messages = [
		{name: "", text: "", style: "text-basic"}
	];
	$scope.socket = io();

	$scope.socket.on("message", (data) => {
		data.style = "text-basic";
		$scope.messages.push(data);
	});
	
	$scope.socket.on("alert", (data) => {
		data.style = "text-alert";
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
.filter("reverse", () => {
	return function(messages) {
		return messages.slice().reverse();
	}
})