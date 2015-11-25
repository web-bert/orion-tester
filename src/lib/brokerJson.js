/* jshint quotmark: false */

function loopData( data, cb ){

	//console.log( data );

	data.forEach( function( country ){

		country.regions.forEach( function( region ){

			region.outcodes.forEach( function( outcode ){

				outcode.parkingLots.forEach( function( lot ){

					var servicePath = [ country.serviceName, region.serviceName, outcode.serviceName, lot.serviceName ].join( '/' );
					
					cb( servicePath, country, region, outcode, lot );
				} );
			} );
		} );
	} );
}

function createRegistration(){

	return {
		"contextRegistrations": [
			{
				"entities": [],
				"attributes": [
					{
						"name": "availability",
						"type": "string",
						"isDomain": false
					}
				],
				"providingApplication": "http://mysensors.com/Rooms"
			}
		],
		"duration": "P1M"
	};
}

module.exports = {

	createContexts: function( data ){

		var dataPaths = {};

		loopData( data, function( servicePath, country, region, outcode, lot ){

			var json = createRegistration();

			lot.spaces.forEach( function( space ){

				json.contextRegistrations[ 0 ].entities.push( {

					"type": "parking_space",
					"isPattern": "false",
					"id": "parking_space_" + space.id
				} );
			} );

			dataPaths[ servicePath ] = json;
		} );

		return dataPaths;
	},

	updateContexts: function( data ){

		var dataPaths = {};

		loopData( data, function( servicePath, country, region, outcode, lot ){
			
			var json = {
				"contextElements": [],
				"updateAction": "APPEND"
			};

			lot.spaces.forEach( function( space ){

				json.contextElements.push( {

					"type": "parking_space",
					"isPattern": "false",
					"id": "parking_space_" + space.id,
					"attributes": [
						{
							"name": "availability",
							"type": "string",
							"value": "available"
						}
					]
				} );
			} );

			dataPaths[ servicePath ] = json;
		} );

		return dataPaths;
	},

	updateAvailability: function( state ){

		return {
			value: state
		};
	}
};