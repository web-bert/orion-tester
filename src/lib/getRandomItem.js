module.exports = function getRandomItem( array ){

	var index = ( array.length > 1 ? Math.floor( Math.random() * array.length ) : 0 ); 

	return  array[ index ];
};