/* jshint quotmark: false */

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

	createContexts: function( dataModel ){

		var dataPaths = {};

		dataModel.forEachParkingLot( function( servicePath, country, region, outcode, lot ){

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

	updateContexts: function( dataModel ){

		var dataPaths = {};

		dataModel.forEachParkingLot( function( servicePath, country, region, outcode, lot ){
			
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
	},

	getContexts: function( dataModel ){

		var dataPaths = {};

		dataModel.forEachParkingLot( function( servicePath, country, region, outcode, lot ){

			var json = {
				"entities": [
					{
						"type": "parking_space",
						"isPattern": "true",
						"id": "parking_space_.*"
					}
				]
			};

			dataPaths[ servicePath ] = json;
		} );

		return dataPaths;
	},

	getContext: function( dataModel ){

		var dataPaths = {};

		dataModel.forEachParkingLot( function( servicePath, country, region, outcode, lot ){

			var space;
			var i = 0;

			while( ( space = lot.spaces[ i++ ] ) ){

				var json = {
					"entities": [
						{
							"type": "parking_space",
							"isPattern": "false",
							"id": "parking_space_" + space.id
						}
					]
				};

				dataPaths[ servicePath ] = json;
			}

		} );

		return dataPaths;
	}
};