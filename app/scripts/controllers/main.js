'use strict';


function Actor() {
	this.name = "";
	this.image = "";
	this.id = -1;
}

function ActorFactory() {
	var ids = -1;
	this.create = function() {
		var actor = new Actor();
		ids += 1;
		actor.id = ids;
		actor["responses-to-rudeness"] = ["na"];
		return actor;
	};
}

function Conversation() {
	this.actors = [];
	this.turns = [];
}

function ConversationFactory() {
	this.create = function() {
		return new Conversation();
	};
}

function getActorIDByValueFromConversation(conversation, actorName) {
	console.log("Looking for "+actorName);
	for(var i in conversation.actors) {
		console.log(i+"->"+conversation.actors[i].name);
		var actor = conversation.actors[i].name;
		if(actor === actorName) {
			return i;
		}
	}
	return -1;
}

function ConversationTurn() {
	this.id = 0;
	this.actor = "";
	this.audioClip = "";
	this.text = "";
	this.previousTurnID = -1;
	
	this.choices = [
		{
			text: "",
			next: -1
		},
		{
			text: "",
			next: -1
		},
		{
			text: "",
			next: -1
		},
		{
			text: "",
			next: -1
		}
	];
}

function TurnFactory() {
	var ids = -1;
	this.create = function(previousID) {
		var newTurn = new ConversationTurn();
		newTurn.previousTurnID = previousID;
		ids += 1;
		newTurn.id = ids;
		
		return newTurn;
	};
}


angular.module('dialogueFactoryApp')
  .controller('MainCtrl', function ($scope, $modal) {
  
  
  	$scope.aceLoaded = function(_editor) {
  		console.log("ACE HAS BEEN LOADED!");	
  	};
  
    $scope.responses = ['First', 'Second', 'Third', 'Fourth'];
    
    $scope.messages = [1, 2, 3, 4, 5];
    $scope.npcNames = [];
    $scope.audioclips = ["1.mp3", "2.mp3", "3.mp3"];
    
    $scope.selectedNPC = $scope.npcNames[0];
	$scope.selectedAudioClip = $scope.audioclips[0];
	
	$scope.selectNPC = function(index) {
		$scope.currentTurn.actor = $scope.npcNames[index];
	};
	
	$scope.selectAudioClip = function(index) {
		$scope.currentTurn.audioClip = $scope.audioclips[index];
	};

	$scope.conversation_json = "{}";
	$scope.$watch('conversation', function(newVal, oldVal) {
		var newConvo = JSON.stringify(newVal, undefined, 2);
		$scope.conversation_json = newConvo;
		
	});
	
	$scope.$watch('conversation.turns', function(newVal, oldVal) {
		console.log("turns changed!");
	}); 

	
	//create current turn
	//refactor this into service.
	var cFactory = new ConversationFactory();
	var tFactory = new TurnFactory();
	$scope.conversation = cFactory.create();
	$scope.currentTurn =  tFactory.create(-1);
	
	$scope.applyCurrentTurn = function() {
	
		$scope.currentTurn.actor = getActorIDByValueFromConversation($scope.conversation, $scope.currentTurn.actor);
		if($scope.currentTurn.id === 0)
		{
			$scope.conversation.turns.push($scope.currentTurn);
		} else if($scope.conversation.turns.length <= $scope.currentTurn.id) {
			$scope.conversation.turns.push($scope.currentTurn);
		} else {
			$scope.conversation.turns[$scope.currentTurn.id] = $scope.currentTurn;
		}
	};
	
	//on next button, save turn, put in Conversation's turn array
	$scope.goToPrevious = function(turn) {
		console.log("previous clicked!");
		$scope.applyCurrentTurn();
		
		if($scope.currentTurn.previousTurnID !== -1) {
			$scope.currentTurn = $scope.conversation.turns[$scope.currentTurn.previousTurnID];
		} else {
			console.log("throw error - ROOT TURN DOES NOT HAVE PREVIOUS TURN");
		}
	};
	
	$scope.goToNext = function(choiceClicked) {
		//TODO: pop-up dialogue asking for new turn or id
		
		console.log("clicked choice: "+choiceClicked);
		$scope.applyCurrentTurn();
		
		//for now, let's just create a new one.
		var nextRef = $scope.currentTurn.choices[choiceClicked].next;
		
		console.log($scope.currentTurn.choices);
		if(nextRef !== -1) {
			console.log("NEXT TURN EXISTS: "+nextRef);
			$scope.currentTurn = $scope.conversation.turns[nextRef];
		} else {
			
			var newTurn = tFactory.create($scope.currentTurn.id);
			console.log("CREATING NEW TURN WITH ID: "+newTurn.id);
			$scope.currentTurn.choices[choiceClicked].next = newTurn.id;
			$scope.currentTurn = newTurn;
		}
		
	};
	
	$scope.saveConversation = function() {
		console.log("save conversation pressed!");
			
		var SaveConversationModalCtrl = function($scope, $modalInstance, payload) {
			$scope.form = {};
			console.log("Modal Initialized!");
			console.log(payload);
			$scope.form.payload = payload;
			$scope.form.options = {
				lineNumbers: true,
				readOnly: false,
				mode: 'javascript'
			};


			$scope.ok = function() {
				console.log("ok pressed!");
				$modalInstance.close();
			};
			
			$scope.cancel = function() {
				console.log("cancel pressed");
				$modalInstance.dismiss('cancel');
			};
		};
		
		var modalInstance = $modal.open({
			templateUrl: 'SaveConversationModal.html',
			controller: SaveConversationModalCtrl,
			resolve: {
				payload: function() {
					return JSON.stringify($scope.conversation);
				}
			}
		});
		
		modalInstance.result.then(function() {
			//don't do anything
		}, function() {
		
		});
	};
	
	$scope.newConversation = function() {
		console.log("new conversation pressed!");
		var NewConversationModalCtrl = function($scope, $modalInstance) {
			$scope.form = {};
			$scope.form.actorName=" ";
			
			$scope.ok = function() {
				console.log("ok pressed!");
				$modalInstance.close($scope.form);
			};
			
			$scope.cancel = function() {
				console.log("cancel pressed!");
				$modalInstance.dismiss('cancel');
			};
		};
		
		var modalInstance = $modal.open({
			templateUrl: 'NewConversationModal.html',
			controller: NewConversationModalCtrl
	
		});
		
		modalInstance.result.then(function(form) {
			var actorName = form.actorName;
			
			//create new actor from actorName
			var aFactory = new ActorFactory();
			var actor = aFactory.create();
			actor.name = actorName;	
			
			var cFactory = new ConversationFactory();
			$scope.conversation = cFactory.create();
			$scope.conversation.actors.push(actor);
			$scope.npcNames.push(actorName);
		}, function() {
			//dismissal 
		});
	
	};	
  });
