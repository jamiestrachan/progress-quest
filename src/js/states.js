pq.StateMachine = function (canvas, initState) {

	function update(state) {
		state.render(canvas);
		canvas.onclick = function (e) {
			var nextState = state.react(e.target.id);
			if (nextState && pq.states[nextState]) {
				update(pq.states[nextState]);
			}
		};
	}

	update(initState);

	return {
		update: update
	};
};

pq.State = function (prerender, template, postrender, nextStates) {
	var view;

	function render(container, model) {
		if (prerender) {
			view = prerender(model);
		}

		if (container) {
			container.innerHTML = Mustache.render(template, view);
		}

		if (postrender) {
			postrender();
		}
	}

	function react(eventId) {
		if (nextStates[eventId]) {
			return nextStates[eventId];
		}
	}

	return {
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
		model.monster1 = new pq.Monster(pq.hero, "small");
		model.monster2 = new pq.Monster(pq.hero, "medium");
		model.monster3 = new pq.Monster(pq.hero, "large");
		return model;
	},
	'<h2>Continue Your Quest</h2><ol><li><p>{{monster1.name}} the level {{monster1.level}} {{monster1.type}} ({{monster1.hp}} HP)</p><p><button id="battle1">Battle!</button></p></li><li><p>{{monster2.name}} the level {{monster2.level}} {{monster2.type}} ({{monster2.hp}} HP)</p><p><button id="battle2">Battle!</button></p></li><li><p>{{monster3.name}} the level {{monster3.level}} {{monster3.type}} ({{monster3.hp}} HP)</p><p><button id="battle3">Battle!</button></p></li></ol>',
	null,
	{
		"battle1": "battle",
		"battle2": "battle",
		"battle3": "battle"
	}
);
pq.states.battle = new pq.State(
	null,
	'<h2>Battle!</h2><p>Enemy HP: <progress id="enemy" max="10" value="10"><span id="currenthp">10</span>/<span id="maxhp">10</span></progress></p><p>Hero AP: <progress id="hero" value="0"></progress></p><button id="victory">Victory!</button>',
	function () {
		var updateInterval = 10;
		var enemyBar = document.getElementById("enemy");
		var enemyHP = enemyBar.value;
		var heroBar = document.getElementById("hero");
		var heroAP = heroBar.value;
		var victoryButton = document.getElementById("victory");
		var damage, timer;

		victoryButton.style.display = 'none';

		function battle () {
			if (!damage) {
				damage = Math.floor(Math.random() * 3) + 1;
				heroBar.max = damage;
			}

			if (heroAP >= damage) { // hit
				enemyHP = enemyHP - damage;
				enemyBar.value = enemyHP;
				heroAP = 0;
				heroBar.value = heroAP;
				damage = 0;

				if (enemyHP <= 0) {
					clearInterval(timer);
					victoryButton.style.display = '';
				}
			} else { // charge
				heroAP = heroAP + (updateInterval / 1000);
				heroBar.value = heroAP;
			}

		}

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