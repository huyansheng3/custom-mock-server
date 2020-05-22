/** @format */

const Mock = require('mockjs');
const { Random } = Mock;

Random.extend({
	direction: function(date) {
		const directions = ['北直', '南直', '北左', '东左', '东直', '南左', '西左', '西直'];
		return this.pick(directions);
	},
});

module.exports = Mock;
