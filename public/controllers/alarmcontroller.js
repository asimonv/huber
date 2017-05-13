function AlarmController($scope, $http){
	console.log('hello! AlarmController!');

	$http.get('/alarms/:alarmID').success(function(response){
		console.log(response);
		$scope.alarmID = response;
	});
}