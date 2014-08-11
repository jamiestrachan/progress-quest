pq.Monster = function (hero, size) {
	var names = ["Apone", "Hicks", "Hudson", "Frost", "Vasquez"];
	var types = ["Space Marine", "Stopwatch", "Blerch"];

	var name = pq.utils.randomFromList(names);
	var type = pq.utils.randomFromList(types);
	var level, hp;

	if (size == "small") {
		level = (hero.level > 1) ? hero.level - 1 : 1;
	} else if (size == "large") {
		level = hero.level + 1;
	} else {
		level = hero.level;
	}

	hp = level * 30;

	return {
		name: name,
		type: type,
		level: level,
		hp: hp
	};	
};