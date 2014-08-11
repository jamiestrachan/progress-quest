pq.StateMachine = function (canvas, initState) {

	function update(state) {
		state.render(canvas);
		canvas.onclick = function (e) {
			var nextState = state.react(e.target.id);
			if (nextState && pq.states[nextState.state]) {
				if (nextState.preswitch) {
					nextState.preswitch.apply(state);
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
	'<h2>Create Your Hero</h2><p><button id="done">Done</button></p>',
	null,
	{
		"done": "activity"
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
		model.monster1 = new pq.Monster(pq.gameState.hero, "small");
		model.monster2 = new pq.Monster(pq.gameState.hero, "medium");
		model.monster3 = new pq.Monster(pq.gameState.hero, "large");
		return model;
	},
	'<h2>Continue Your Quest</h2><ol><li><p>{{monster1.name}} the level {{monster1.level}} {{monster1.type}} ({{monster1.hp}} HP)</p><p><button id="battle1">Battle!</button></p></li><li><p>{{monster2.name}} the level {{monster2.level}} {{monster2.type}} ({{monster2.hp}} HP)</p><p><button id="battle2">Battle!</button></p></li><li><p>{{monster3.name}} the level {{monster3.level}} {{monster3.type}} ({{monster3.hp}} HP)</p><p><button id="battle3">Battle!</button></p></li></ol>',
	null,
	{
		"battle1": { "state": "battle", "preswitch": function () { pq.gameState.monster = this.model.monster1; } },
		"battle2": { "state": "battle", "preswitch": function () { pq.gameState.monster = this.model.monster2; } },
		"battle3": { "state": "battle", "preswitch": function () { pq.gameState.monster = this.model.monster3; } },
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
		var damage, timer, start, then;

		victoryButton.style.display = 'none';

		function battle () {
			if (!damage) {
				damage = pq.utils.rnd(pq.gameState.hero.hitMin, pq.gameState.hero.hitMax);
				heroBar.max = damage;
			}

			if (heroAP >= damage) { // hit
				enemyHP = enemyHP - damage;
				enemyBar.value = enemyHP;
				document.getElementById("currenthp").innerHTML = (enemyHP >= 0) ? enemyHP : 0;
				heroAP = 0;
				heroBar.value = heroAP;
				damage = 0;

				if (enemyHP <= 0) {
					clearInterval(timer);
					victoryButton.style.display = '';
					console.log(((new Date().getTime() - start) / 1000) + " seconds");
				} else {
					then = new Date().getTime();
				}
			} else { // charge
				heroAP = heroAP + ((new Date().getTime() - then) / 1000);
				heroBar.value = heroAP;
				then = new Date().getTime();
			}

		}

		start = new Date().getTime();
		then = new Date().getTime();
		timer = setInterval(battle, updateInterval);
	},
	{
		"victory": "result"
	}
);
pq.states.result = new pq.State(
	null,
	'<h2>Victory!</h2><p>Loot!</p><p><button id="battle1">Battle 1</button> <button id="battle2">Battle 2</button> <button id="battle3">Battle 3</button></p><p><button id="rest">Rest</button></p>',
	null,
	{
		"battle1": "battle",
		"battle2": "battle",
		"battle3": "battle",
		"rest": "activity"
	}
);