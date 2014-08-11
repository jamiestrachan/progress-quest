pq.Monster = function (size) {
	var names = ["Apone", "Hicks", "Hudson", "Frost", "Vasquez"];
	var types = ["Space Marine", "Stopwatch", "Blerch"];

	var name = pq.utils.randomFromList(names);
	var type = pq.utils.randomFromList(types);
	var level, hp;

	if (size == "small") {
		level = (pq.gameState.hero.level > 1) ? pq.gameState.hero.level - 1 : 1;
	} else if (size == "large") {
		level = pq.gameState.hero.level + 1;
	} else {
		level = pq.gameState.hero.level;
	}

	hp = level * 60;

	return {
		name: name,
		type: type,
		level: level,
		hp: hp
	};	
};