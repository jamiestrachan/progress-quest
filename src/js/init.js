pq.hero = new pq.Hero();

pq.sm = new pq.StateMachine(document.getElementById("canvas"), pq.states.menu);

pq.updateState = function(state) {
	pq.sm.update(state);
};