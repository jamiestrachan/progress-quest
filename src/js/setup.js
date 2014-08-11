var pq = {};

pq.utils = {};

pq.utils.rnd = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

pq.utils.randomFromList = function (list) {
	return list[pq.utils.rnd(0, list.length - 1)];
};