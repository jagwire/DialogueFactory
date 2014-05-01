'use strict';

var treeData = {
    name: "/",
    contents: [
        {
            name: "Applications",
            contents: [
                { name: "Mail.app" },
                { name: "iPhoto.app" },
                { name: "Keynote.app" },
                { name: "iTunes.app" },
                { name: "XCode.app" },
                { name: "Numbers.app" },
                { name: "Pages.app" }
            ]
        },
        {
            name: "System",
            contents: []
        },
        {
            name: "Library",
            contents: [
                {
                    name: "Application Support",
                    contents: [
                        { name: "Adobe" },
                        { name: "Apple" },
                        { name: "Google" },
                        { name: "Microsoft" }
                    ]
                },
                {
                    name: "Languages",
                    contents: [
                        { name: "Ruby" },
                        { name: "Python" },
                        { name: "Javascript" },
                        { name: "C#" }
                    ]
                },
                {
                    name: "Developer",
                    contents: [
                        { name: "4.2" },
                        { name: "4.3" },
                        { name: "5.0" },
                        { name: "Documentation" }
                    ]
                }
            ]
        },
        {
            name: "opt",
            contents: []
        },
        {
            name: "Users",
            contents: [
                { name: "pavanpodila" },
                { name: "admin" },
                { name: "test-user" }
            ]
        }
    ]
};

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

function getTurnByID(conversation, id) {
	if(id === -1) {
		return {
			choices: []
		};
	}
	for(var i in conversation.turns) {
	
		if(id === conversation.turns[i].id) {
			return conversation.turns[i];
		}
	}
	
	return conversation.turns[id];
}


function ConversationTurn() {
	this.id = -1;
	this.actor = "";
	this.audioClip = "";
	this.text = "";
	this.previousTurnID = -1;
	
	this.choices = [
		{
			text: "",
// 			next: -1,
			"next-turn": -1
		},
		{
			text: "",
// 			next: -1,
			"next-turn": -1
		},
		{
			text: "",
// 			next: -1,
			"next-turn": -1
		},
		{
			text: "",
// 			next: -1,
			"next-turn": -1
		}
	];
}

var turnData = {
	choices: [
		{
			choices: []
		}, {
			choices: []
		}, {
			choices: []
		}
	]

};

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
  
  
  	$scope.zeroclipboard_client = new ZeroClipboard(document.getElementById('copy-button'));
  	$scope.zeroclipboard_client.on("ready", function(readyEvent) {
  		console.log("clippy ready!");
  	
  		$scope.zeroclipboard_client.on("aftercopy", function(event) {
  			console.log("copied!");
  		});
  	});
  
  	$scope.aceLoaded = function(_editor) {
  		console.log("ACE HAS BEEN LOADED!");	
  	};
  
    $scope.responses = ['First', 'Second', 'Third', 'Fourth'];
    
    $scope.messages = [1, 2, 3, 4, 5];
    $scope.npcNames = [];
    $scope.audioclips = ["1.mp3", "2.mp3", "3.mp3"];
    
    $scope.selectedNPC = "";
	$scope.selectedAudioClip = $scope.audioclips[0];
	
	$scope.selectNPC = function(index) {
		console.log("SELECTED: "+$scope.npcNames[index]);
		$scope.currentTurn.actor = $scope.npcNames[index];
		console.log("RETURNING: "+$scope.npcNames[index]);
		$scope.selectedNPC = $scope.npcNames[index];
	};
	
	$scope.selectAudioClip = function(index) {
		$scope.currentTurn.audioClip = $scope.audioclips[index];
	};

	$scope.conversation_json = "{}";
	$scope.canvases = [0];
	
	$scope.$watch('conversation', function(newVal, oldVal) {
		var newConvo = JSON.stringify(newVal, undefined, 2);
		$scope.conversation_json = newConvo;
		
		
		rebuildGraph();
		
	});
	
	$scope.$watch('currentTurn', function(newVal, oldVal) {
		console.log("turns changed!");
		var newConvo = JSON.stringify($scope.conversation, undefined, 2);
		$scope.conversation_json = newConvo;
		
		rebuildGraph();
	}); 

	
	//create current turn
	//refactor this into service.
	var cFactory = new ConversationFactory();
	var tFactory = new TurnFactory();
	$scope.conversation = cFactory.create();
	$scope.currentTurn =  tFactory.create(-1);
	
	$scope.applyCurrentTurn = function() {
		
		console.log("OLD CURRENT TURN ACTOR: "+$scope.selectedNPC);
		if(typeof $scope.selectedNPC === "string") {
			$scope.currentTurn.actor = parseInt(getActorIDByValueFromConversation($scope.conversation, $scope.selectedNPC));
		}
		console.log("NEW CURRENT TURN ACTOR: "+$scope.currentTurn.actor);
		// if($scope.currentTurn.id === 0)
// 		{
// 			$scope.conversation.turns.push($scope.currentTurn);
// 		} else
		 if($scope.conversation.turns.length <= $scope.currentTurn.id) {
			$scope.conversation.turns.push($scope.currentTurn);
		} else {
			$scope.conversation.turns[$scope.currentTurn.id] = $scope.currentTurn;
		}
		
		$scope.conversation_json = JSON.stringify($scope.conversation, undefined, 2);
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
// 		var nextRef = $scope.currentTurn.choices[choiceClicked].next;
		var nextRef = $scope.currentTurn.choices[choiceClicked]["next-turn"];
		
		console.log($scope.currentTurn.choices);
		if(nextRef !== -1) {
			console.log("NEXT TURN EXISTS: "+nextRef);
			$scope.currentTurn = $scope.conversation.turns[nextRef];
		} else {
			
			var newTurn = tFactory.create($scope.currentTurn.id);
			console.log("CREATING NEW TURN WITH ID: "+newTurn.id);
// 			$scope.currentTurn.choices[choiceClicked].next = newTurn.id;
			$scope.currentTurn.choices[choiceClicked]["next-turn"] = newTurn.id;
			
			$scope.currentTurn = newTurn;
		}
		
	};
	
	$scope.saveConversation = function() {
		console.log("save conversation pressed!");
		$scope.applyCurrentTurn();
			
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
					return JSON.stringify($scope.conversation, undefined, 2);
				},
				
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
			$scope.npcNames = [];
			$scope.npcNames.push(actorName);
		}, function() {
			//dismissal 
		});
	
	};	
	
	var testTurns = [
		{
			id: 1,
			choices: [{
				"next-turn": 2
			}, {
				"next-turn": 3
			}]
		}, {
			id: 2,
			choices: [{
				"next-turn": 4
			}, {
				"next-turn": 5
			}]
		}, {
			id: 3,
			choices: []
		}, {
			id: 4,
			choices: []
		}, {
			id: 5,
			choices: []
		}
	];
	
	var testConversation = {
		turns: testTurns
	};
	
	//graph section
	var rebuildGraph = function() {
		// var tree = d3.layout.tree()
// 					.sort(null)
// 					.size([400, 400])
// 					.children(function(turn) {
// 				
// 						var output = [];
// 						if(typeof turn === "undefined") { return []; }
// 						console.log("uh: "+toString(turn));
// 						console.log(turn);
// 						console.log("processing turn: "+turn.id);
// 						for(var i in turn.choices) {
// 							var choice = turn.choices[i];
// 							console.log("Adding turn: "+choice["next-turn"]+"->"+getTurnByID(testConversation,choice["next-turn"]).id);
// 							output.push(getTurnByID($scope.conversation,choice["next-turn"]));
// 						}
// 				
// 						return (!turn.choices || turn.choices.length === 0)  ? null : output;
// 					});
// 
// 		$scope.nodes = tree.nodes($scope.conversation.turns[0]);
// 		$scope.links = tree.links($scope.nodes);
// 		console.log($scope.conversation.turns[0]);
	}
	// 
// 	turns: [{
// 		choices: [{
// 			next-turn: 0
// 		}]
// 	}
// 	
// 	turns: { 
// 		choices:[{
// 				next-turn: {
// 					choices: [{
// 							next-turn: { 
// 								choices: []
// 								}
// 						}]
// 					}
// 				}]
  });
