function TaskController($scope, $http){
	console.log('hello! TaskController');

	$scope.formatNumber = function(i) {
	    return Math.round(i)
	}

	$scope.titleFormatting = function(i){
		return i.style.textTransform = "capitalize"
	}

	$scope.creatorFormatting = function(i){
		return i.toUpperCase()
	}

	$http.get('/tasks').success(function(response){
		console.log(response);

		for (var i = response.length - 1; i >= 0; i--) {

			var p = 100*response[i].current / response[i].goal

			if (p < 25){
				response[i].progressClass = 'progress-bar-danger'
			}

			else if (p < 50){
				response[i].progressClass = 'progress-bar-warning'
			}

			else if (p < 95){
				response[i].progressClass = 'progress-bar-info'
			}

			else{
				response[i].progressClass = 'progress-bar-success'
			}

			if(response[i].percentage < 100){
				response[i].completed = 'none'
			}
		};

		$scope.tasks = response;
	});
}