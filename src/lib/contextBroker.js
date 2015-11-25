
var brokerJson = require( './brokerJson' );
var sendRequest = require( './sendBrokerRequest' );

function addServicePathHeader( servicePath, headers ){

	if( servicePath.charAt( 0 ) !== '/' ){

		servicePath = '/' + servicePath;
	}

	headers[ 'Fiware-ServicePath' ] = servicePath;
}

function sendRequests( path, servicePaths, cb ){

	var servicePathKeys = Object.keys( servicePaths );
	//var lastIndex = servicePathKeys.length - 1;
	var totalRequests = servicePathKeys.length;
	var requestsCompleted = 0;
	var errors = [];

	function handleResponse( err ){

		requestsCompleted++;

		if( err ){

			errors.push( err );
		}

		if( requestsCompleted === totalRequests ){

			console.log( '%s requests sent, %s error(s)', totalRequests, errors.length );
			cb( errors );
		}
	}

	servicePathKeys.forEach( function( servicePath, index ){

		//console.log( servicePath, servicePaths[ servicePath ] );
		var json = servicePaths[ servicePath ];
		var headers = {};

		addServicePathHeader( servicePath, headers );

		sendRequest( handleResponse, {
			method: 'POST',
			path: path,
			data: json,
			headers: headers
		} );
		// if( index === lastIndex ){
		// 	cb();
		// }
	} );
}

module.exports = {

	getContexts: function( cb, servicePath ){

		var path = '/v1/registry/discoverContextAvailability';
		var headers = {};
		var json = {
				"entities": [
					{
						"type": "parking_space",
						"isPattern": "true",
						"id": "parking_space_.*"
					}
				]
			};

		if( servicePath ){

			addServicePathHeader( servicePath, headers );
		}

		sendRequest( cb, {
			method: 'POST',
			path: path,
			data: json,
			headers: headers
		} );
	},

	createContexts: function( data, cb ){

		var path = '/v1/registry/registerContext';
		var servicePaths = brokerJson.createContexts( data );
		
		sendRequests( path, servicePaths, cb );
	},

	initialiseContexts: function( data, cb ){

		var path = 'v1/updateContext';
		var servicePaths = brokerJson.updateContexts( data );
		
		sendRequests( path, servicePaths, cb );
	},

	updateState: function( servicePath, spaceId, state, cb ){

		var path = 'v1/contextEntities/parking_space_' + spaceId + '/attributes/availability';
		var json = brokerJson.updateAvailability( state );
		var headers = {};

		addServicePathHeader( servicePath, headers );

		sendRequest( cb, {
			method: 'PUT',
			path: path,
			data: json,
			headers: headers
		} );
	}
};