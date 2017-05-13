
		$(function(){
			var socket = io();
			var state = true;

			var alarm;

			socket.on('new_task', function(data){
				console.log('recieved new task')

				var task = data.msg

				var obj = '<div class="tasks" ng-repeat="task in tasks"><p class="task-title">'+task.name+' <i class="icon icon-xs icon-map-marker"></i></p><p class="creator-title">'+task.by+'</p><div class="row"><div class="col-md-12"><div class="row"><div class="col-md-10"><div class="progress"><div id="'+task._id+'" class="progress-bar progress-bar-danger progress-bar-striped active task-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width:0%">0%</div></div></div><div class="col-md-2"><p><span id="tsk-'+task._id+'-cr" class="task-current">'+task.current+'</span>/<span id="tsk-'+task._id+'-gl" class="task-goal">'+task.goal+'</span></p></div></div><button id="'+task._id+'" class="button-update btn">update</button></div></div></div>'

				$(obj).hide().prependTo("#task-container").fadeIn(1000);


			})

			socket.on('data', function (data) {
			  console.log(data);
			});

			socket.on('connected', function (data) {
			  console.log('what');
			});

			socket.on('task_completed', function(data){
				console.log(data);
				console.log('task completed')

				$.when($('.navbar-item').fadeOut(300)).done(function(){
					$(".task-completed-notification").fadeIn(500);
				});

				var sound = new Howl({
				  src: ['/assets/audio/arpeggio.mp3']
				});

				sound.play();
			})

			socket.on('new_alarm', function(data){
				console.log(data);

				alarm = data.msg;

				$('.btn-go-alert').attr('data-id', alarm._id);

				$.when($('.navbar-item').fadeOut(300)).done(function(){
					$(".alert-navbar").fadeIn(500);
				});

				var sound = new Howl({
				  src: ['/assets/audio/gentle-alarm.mp3']
				});

				sound.play();

			});

			socket.on('update_task', function(data){
				console.log('recieving data')
				
				var obj = data.msg

				console.log(obj);

				$('#'+ obj._id).css('width', obj.percentage+'%').attr('aria-valuenow', obj.percentage);
				$('#tsk-'+obj._id + '-cr').text(obj.current)
				$('#tsk-'+obj._id + '-gl').text(obj.goal)

				$('#'+ obj._id).attr('class', 'progress-bar ' + obj.progressClass + ' progress-bar-striped active task-progress')
				$('#'+ obj._id).text(`${Math.round(obj.percentage)}%`)

			});

			$(document).on('click', ".button-update", function() {
				console.log('updated task');

				socket.emit('update_task', {id: this.id, name: 'cool'}); 
				/*

				$.notify("Huber detected a posible fire", {
					style: 'happyblue',
					className:  "error",
					autoHide: false,
					clickToHide: true,
					showAnimation: 'slideDown'
				});

				

				(function(count) {
			        if (count < 10) {
			            // call the function.
			            foo(); 

			            // The currently executing function which is an anonymous function.
			            var caller = arguments.callee; 
			            window.setTimeout(function() {
			                // the caller and the count variables are
			                // captured in a closure as they are defined
			                // in the outside scope.
			                caller(count + 1);
			            }, 500);    
			        }
			    })(0);
				*/
			
			});

			$('#add-task-button').on('click', function(){
				$('#myModal').modal('toggle')
			});

			$('.btn-dismiss-alert').on('click', function(){

				if($('.alert-navbar').is(':visible')){
					$.when($('.alert-navbar').fadeOut(500)).done(function(){
						$('.navbar-item').fadeIn(300);
					});
				}

				else if($('.task-completed-notification').is(':visible')){
					$.when($('.task-completed-notification').fadeOut(500)).done(function(){
						$('.navbar-item').fadeIn(300);
					});
				}

				
				
			});

			$('.btn-go-alert').on('click', function(){
				$.when($('.alert-navbar').fadeOut(500)).done(function(){
					$('.navbar-item').fadeIn(300);
				});

				window.location.replace("/alarms/" + $(this).attr('data-id'));
				
			});

			$('#button-submit-new-task').on('click', function(){
				var data = {name: $('#inputEmail3').val(), goal: $('#inputPassword3').val(), description: $('#new-task-description').val()}
				socket.emit('new_task', data);
				$('#myModal').modal('toggle');
			});

			function foo(){
			    var b = Math.floor((Math.random() * 100) + 1);
			    var d = ["flowOne", "flowTwo", "flowThree"];
			    var a = ["colOne", "colTwo", "colThree", "colFour", "colFive", "colSix"];
			    var c = (Math.random() * (1.6 - 1.2) + 1.2).toFixed(1);
			    $('<div class="particle part-' + b + " " + a[Math.floor((Math.random() * 6))] + '" style="font-size:' + Math.floor(Math.random() * (30 - 22) + 22) + 'px;"><i class="fa fa-heart-o"></i><i class="fa fa-heart"></i></div>').appendTo(".particle-box").css({
			        animation: "" + d[Math.floor((Math.random() * 3))] + " " + c + "s linear"
			    });
			    $(".part-" + b).show();
			    setTimeout(function() {
			        $(".part-" + b).remove()
			    }, c * 1000 - 100)
			}

			$(document).on('click', '.notifyjs-happyblue-base', function() {
			  //programmatically trigger propogating hide event
			  console.log("dismiss");
			  $(this).trigger('notify-hide');
			});

			$.notify.addStyle('happyblue', {
			  html: "<div><i class='icon icon-xs icon-white icon-fire'></i> <span data-notify-text/></div>",
			  classes: {
			    base: {
			      "white-space": "nowrap",
			      "background-color": "#F22613",
			      "padding": "10px",
			      "color": "white",
			      "border-radius": "5px",
			      "font-weight": "500"
			    },
			    superblue: {
			      "color": "white",
			      "background-color": "blue"
			    }
			  }
			});

		});