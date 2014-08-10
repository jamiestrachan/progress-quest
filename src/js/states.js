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

pq.State = function (template, nextStates) {

	function render(container) {
		if (container) {
			container.innerHTML = template;
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
	'<button id="startnew">Start New</button> <button id="continue">Continue</button>',
	{
		"startnew": "activity",
		"continue": "activity"
	}
);
pq.states.activity = new pq.State(
	'<button id="quit">Quit</button>',
	{
		"quit": "menu"
	}
);