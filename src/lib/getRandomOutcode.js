
var getRandomItem = require( './getRandomItem' );

module.exports = function getRandomOutcode( data ){

	var townData = getRandomItem( data );
	var regionData = getRandomItem( townData.regions );

	return {

		townData: townData,
		regionData: regionData,
		outcode: getRandomItem( regionData.outcodes )
	};
};