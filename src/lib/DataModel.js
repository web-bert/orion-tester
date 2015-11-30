
var getRandomItem = require( './getRandomItem' );

function getServicePath( /* items */ ){

	var arg;
	var i = 0;
	var paths = [];

	while( ( arg = arguments[ i++] ) ){

		paths.push( arg.serviceName );
	}

	return paths.join( '/' );
}

function trimArray( array, maxItems ){

	while( array.length > maxItems ){

		array.splice( Math.floor( Math.random() * array.length ), 1 );
	}
}


function DataModel( data ){

	this.data = data;
}

DataModel.prototype.hasData = function(){
	
	return ( !!this.data && !!this.data.length );
};

DataModel.prototype.forEachParkingLot = function( cb ){

	//console.log( this.data );

	this.data.forEach( function( country ){

		country.regions.forEach( function( region ){

			region.outcodes.forEach( function( outcode ){

				outcode.parkingLots.forEach( function( lot ){

					var servicePath = getServicePath( country, region, outcode, lot );
					
					cb( servicePath, country, region, outcode, lot );
				} );
			} );
		} );
	} );
};

DataModel.prototype.getRandomCountry = function(){
	
	return getRandomItem( this.data );
};

DataModel.prototype.getRandomRegion = function( country ){
	
	return getRandomItem( country.regions );
};

DataModel.prototype.getRandomOutcode = function( region ){
	
	return getRandomItem( region.outcodes );
};

DataModel.prototype.getRandomParkingLot = function( outcode ){
	
	return getRandomItem( outcode.parkingLots );
};

DataModel.prototype.getRandomSpace = function( parkingLot ){

	return getRandomItem( parkingLot.spaces );
};

DataModel.prototype.pickRandomOutcode = function(){
	
	var country =  this.getRandomCountry();
	var region = this.getRandomRegion( country );
	var outcode = this.getRandomOutcode( region );

	return {
		servicePath: getServicePath( country, region, outcode ),
		outcode: outcode
	};
};

DataModel.prototype.pickRandomParkingLot = function(){
	
	var country =  this.getRandomCountry();
	var region = this.getRandomRegion( country );
	var outcode = this.getRandomOutcode( region );
	var lot = this.getRandomParkingLot( outcode );

	return {
		servicePath: getServicePath( country, region, outcode, lot ),
		data: {
			country: country,
			region: region,
			outcode: outcode,
			parkingLot: lot
		}
	};
};

DataModel.prototype.pickRandomSpace = function(){
	
	var country =  this.getRandomCountry();
	var region = country && this.getRandomRegion( country );
	var outcode = region && this.getRandomOutcode( region );
	var lot = outcode && this.getRandomParkingLot( outcode );
	var space = lot && this.getRandomSpace( lot );

	if( space ){

		return {
			servicePath: getServicePath( country, region, outcode, lot, space ),
			data: {
				country: country,
				region: region,
				outcode: outcode,
				parkingLot: lot,
				space: space
			}
		};
	}
};

DataModel.prototype.oneSpaceEach = function(){

	this.data.forEach( function( country ){

		country.regions.splice( 1, country.regions.length );
		country.regions[ 0 ].outcodes.splice( 1, country.regions[ 0 ].outcodes.length );
		country.regions[ 0 ].outcodes[ 0 ].parkingLots.splice( 1, country.regions[ 0 ].outcodes[ 0 ].parkingLots.length );
		country.regions[ 0 ].outcodes[ 0 ].parkingLots[ 0 ].spaces.splice( 1, country.regions[ 0 ].outcodes[ 0 ].parkingLots[ 0 ].spaces.length );
	} );

	//console.log( require( 'util' ).inspect( data, { depth: 10 } ) );
};

DataModel.prototype.setMaxParkingLots = function( maxLots ){

	this.data.forEach( function( country ){

		country.regions.forEach( function( region ){

			region.outcodes.forEach( function( outcode ){

				trimArray( outcode.parkingLots, maxLots );
			} );
		} );
	} );
};

DataModel.prototype.setMaxOutCodes = function( maxOutcodes ){
	
	this.data.forEach( function( country ){

		country.regions.forEach( function( region ){

			trimArray( region.outcodes, maxOutcodes );
		} );
	} );
};

DataModel.prototype.setMaxRegions = function( maxRegions ){
	
	this.data.forEach( function( country ){

		trimArray( country.regions, maxRegions );
	} );
};

module.exports = DataModel;