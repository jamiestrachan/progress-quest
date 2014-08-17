pq.Hero = function () {
	var name = "Hero";
	var level = 1;
	var hitMin = 1;
	var hitMax = 3;

	function levelUp () {
		level++;
	}

	return {
		name: name,
		level: level,
		levelUp: levelUp,
		hitMin: hitMin,
		hitMax: hitMax
	};	
};