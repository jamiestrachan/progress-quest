pq.StateMachine = function (canvas, initState) {

	function update(state) {
		state.render(canvas);
		canvas.onclick = function (e) {
			var nextState = state.react(e.target.id);
			if (nextState && pq.states[nextState.state]) {
				if (nextState.preswitch) {
					nextState.preswitch(state, pq.states[nextState.state]);
				}
				update(pq.states[nextState.state]);
			}
		};
	}

	update(initState);

	return {
		update: update
	};
};

pq.State = function (prerender, template, postrender, nextStates) {
	var model = {};

	function render(container) {
		if (prerender) {
			model = prerender(model);
		}

		if (container) {
			container.innerHTML = Mustache.render(template, model);
		}

		if (postrender) {
			postrender();
		}
	}

	function react(eventId) {
		if (nextStates[eventId]) {
			if (typeof nextStates[eventId] === "string") {
				return { "state": nextStates[eventId] };
			} else {
				return nextStates[eventId];
			}
		}
	}

	return {
		model: model,
		render: render,
		react: react
	};
};

pq.states = {};
pq.states.menu = new pq.State(
	null,
	'<p><button id="startnew">Start New</button> <button id="continue">Continue</button></p>',
	null,
	{
		"startnew": "intro",
		"continue": "activity"
	}
);
pq.states.intro = new pq.State(
	null,
	'<h2>Intro</h2><p><button id="continue">Continue</button></p>',
	null,
	{
		"continue": "createHero"
	}
);
pq.states.createHero = new pq.State(
	null,
	'<h2>Create Your Hero</h2><p><label for="heroname">Hero Name:</label><input type="text" name="heroname" id="heroname" /></p><p><button id="done">Done</button></p>',
	function () {
		var nameField = document.getElementById("heroname");
		var doneButton = document.getElementById("done");

		doneButton.disabled = true;

		nameField.onkeyup = function (e) {
			if(nameField.value.length > 0) {
				doneButton.disabled = false;
			}
		};
	},
	{
		"done": { "state": "activity", "preswitch": function (thisState, nextState) { pq.gameState.hero.name = document.getElementById("heroname").value; } },
	}
);
pq.states.activity = new pq.State(
	null,
	'<h2>Choose an Activity</h2><p><button id="createClass">Create a New Class</button> <button id="startQuest">Start a New Quest</button> <button id="continueQuest">Continue a Quest</button></p><p><button id="quit">Quit</button></p>',
	null,
	{
		"createClass": "createClass",
		"startQuest": "startQuest",
		"continueQuest": "quest",
		"quit": "menu"
	}
);
pq.states.createClass = new pq.State(
	null,
	'<h2>Create a Class</h2><p><button id="done">Done</button></p>',
	null,
	{
		"done": "activity"
	}
);
pq.states.startQuest = new pq.State(
	null,
	'<h2>Start a Quest</h2><p><button id="done">Done</button></p>',
	null,
	{
		"done": "activity"
	}
);
pq.states.quest = new pq.State(
	function (model) {
		model.monster1 = new pq.Monster("small");
		model.monster2 = new pq.Monster("medium");
		model.monster3 = new pq.Monster("large");
		return model;
	},
	'<h2>Continue Your Quest</h2><ol><li><p>{{monster1.name}} the level {{monster1.level}} {{monster1.type}} ({{monster1.hp}} HP)</p><p><button id="battle1">Battle!</button></p></li><li><p>{{monster2.name}} the level {{monster2.level}} {{monster2.type}} ({{monster2.hp}} HP)</p><p><button id="battle2">Battle!</button></p></li><li><p>{{monster3.name}} the level {{monster3.level}} {{monster3.type}} ({{monster3.hp}} HP)</p><p><button id="battle3">Battle!</button></p></li></ol>',
	null,
	{
		"battle1": { "state": "battle", "preswitch": function (thisState, nextState) { pq.gameState.monster = thisState.model.monster1; } },
		"battle2": { "state": "battle", "preswitch": function (thisState, nextState) { pq.gameState.monster = thisState.model.monster2; } },
		"battle3": { "state": "battle", "preswitch": function (thisState, nextState) { pq.gameState.monster = thisState.model.monster3; } }
	}
);
pq.states.battle = new pq.State(
	function (model) {
		model.hero = pq.gameState.hero;
		model.monster = pq.gameState.monster;
		return model;
	},
	'<h2>Battle!</h2><p>{{monster.name}} the level {{monster.level}} {{monster.type}}</p><p>Enemy HP: <progress id="enemy" max="{{monster.hp}}" value="{{monster.hp}}"></progress><span id="currenthp">{{monster.hp}}</span>/<span id="maxhp">{{monster.hp}}</span></p><p>Hero AP: <progress id="hero" value="0"></progress></p><button id="victory">Victory!</button>',
	function () {
		var updateInterval = 50;
		var enemyBar = document.getElementById("enemy");
		var enemyHP = enemyBar.value;
		var heroBar = document.getElementById("hero");
		var heroAP = heroBar.value;
		var victoryButton = document.getElementById("victory");
		var damage, timer, startCharge, startDamage;

		victoryButton.style.display = 'none';

        function setDamage () {
            damage = pq.utils.rnd(pq.gameState.hero.hitMin, (enemyHP >= pq.gameState.hero.hitMax) ? pq.gameState.hero.hitMax : enemyHP);
            heroBar.max = damage;
            startDamage = new Date().getTime();
        }

		function battle () {
            // charge
            heroAP = heroAP + pq.utils.secondsSince(startCharge);
            heroBar.value = heroAP;
            startCharge = new Date().getTime();

			if (heroAP >= damage) { // hit
				enemyHP = enemyHP - pq.utils.secondsSince(startDamage);
				enemyBar.value = Math.ceil(enemyHP);
				document.getElementById("currenthp").innerHTML = (enemyHP >= 0) ? Math.ceil(enemyHP) : 0;
				console.timeEnd("damage");
				heroAP = 0;
				heroBar.value = heroAP;
                setDamage();
			}

            if (enemyHP <= 0) {
                victoryButton.style.display = '';
                console.timeEnd("battle");
            } else {
                timer = setTimeout(battle, (((damage - heroAP) * 1000) < updateInterval) ? (damage - heroAP) : updateInterval);
            }
		}

		console.time("battle");
        setDamage();
		startCharge = new Date().getTime();
		timer = setTimeout(battle, updateInterval);
	},
	{
		"victory": "result"
	}
);
pq.states.result = new pq.State(
	function (model) {
		model.defeatedMonster = pq.gameState.monster;
		pq.gameState.monster = null;
		model.monster1 = new pq.Monster("small");
		model.monster2 = new pq.Monster("medium");
		model.monster3 = new pq.Monster("large");
		return model;
	},
	'<h2>Victory!</h2><p>You defeated {{defeatedMonster.name}} the level {{defeatedMonster.level}} {{defeatedMonster.type}}!</p><h2>Battle Again?</h2><ol><li><p>{{monster1.name}} the level {{monster1.level}} {{monster1.type}} ({{monster1.hp}} HP)</p><p><button id="battle1">Battle!</button></p></li><li><p>{{monster2.name}} the level {{monster2.level}} {{monster2.type}} ({{monster2.hp}} HP)</p><p><button id="battle2">Battle!</button></p></li><li><p>{{monster3.name}} the level {{monster3.level}} {{monster3.type}} ({{monster3.hp}} HP)</p><p><button id="battle3">Battle!</button></p></li></ol><h2>Take a Break</h2><p><button id="rest">Rest</button></p>',
	null,
	{
		"battle1": { "state": "battle", "preswitch": function (thisState, nextState) { pq.gameState.monster = thisState.model.monster1; } },
		"battle2": { "state": "battle", "preswitch": function (thisState, nextState) { pq.gameState.monster = thisState.model.monster2; } },
		"battle3": { "state": "battle", "preswitch": function (thisState, nextState) { pq.gameState.monster = thisState.model.monster3; } },
		"rest": "activity"
	}
);