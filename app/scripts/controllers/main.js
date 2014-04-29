'use strict';


function Actor() {
	this.name = "";
	this.image = "";
	this.id = -1;
	this.responsesToRudeness = [];
}

function ActorFactory() {
	var ids = -1;
	this.create = function() {
		var actor = new Actor();
		ids += 1;
		actor.id = ids;
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

var width = 300;
var height = 400;

function buildGraph(conversation) {
	var g = new Graph();
	
	for(var i in conversation.turns) {
		var turn = conversation.turns[i];
		g.addNode(turn.id);
		
		for(var j in turn.choices) {
			if(turn.choices[j].next === -1) { continue; }
			
			g.addEdge(turn.id, turn.choices[j].next);
		}
	}
	
	var layouter = new Graph.Layout.Spring(g);
	layouter.layout();
	
	var renderer = new Graph.Renderer.Raphael('canvas', g, 300, 400);
	renderer.draw();
	
	var redraw = function() {
		layouter.layout();
		renderer.draw();
	};
}


angular.module('dialogueFactoryApp')
  .controller('MainCtrl', function ($scope) {
    $scope.responses = ['First', 'Second', 'Third', 'Fourth'];
    
    $scope.messages = [1, 2, 3, 4, 5];
    $scope.npcNames = ["Dr Topos",  "Colonel", "Dr Lang"];
    $scope.audioclips = ["1.mp3", "2.mp3", "3.mp3"];
    
    $scope.selectedNPC = $scope.npcNames[0];
	$scope.selectedAudioClip = $scope.audioclips[0];
	
	$scope.selectNPC = function(index) {
		$scope.currentTurn.actor = $scope.npcNames[index];
	};
	
	$scope.selectAudioClip = function(index) {
		$scope.currentTurn.audioClip = $scope.audioclips[index];
	};
	
	$scope.buildGraph = function() {
		buildGraph($scope.conversation);	
	};
	
	//create current turn
	//refactor this into service.
	var cFactory = new ConversationFactory();
	var tFactory = new TurnFactory();
	$scope.conversation = cFactory.create();
	$scope.currentTurn =  tFactory.create(-1);
	
	$scope.applyCurrentTurn = function() {
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
  });
