
var brokerJson = require( './brokerJson' );
var sendRequest = require( './sendBrokerRequest' );

function addServicePathHeader( servicePath, headers ){

	if( servicePath && servicePath.charAt( 0 ) !== '/' ){

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
	var currentIndex = 0;
	var concurrentRequests = 40;
	var requestsSent = 0;
	var startTime = ( new Date() ).getTime();
	var batchStartTime = ( new Date() ).getTime();

	function handleResponse( err ){

		requestsCompleted++;

		if( err ){

			errors.push( err );
			console.log( errors );
		}

		if( ( errors.length && requestsCompleted === requestsSent ) || requestsCompleted === totalRequests ){

			console.log( '%s requests sent in %s seconds, %s error(s)', totalRequests, ( ( new Date() ).getTime() - startTime ) / 1000, errors.length );
			cb( errors );

		} else {

			if( requestsCompleted % 1000 === 0 ){

				console.log( '%s requests completed in %s seconds', requestsCompleted, ( ( new Date() ).getTime() - batchStartTime ) / 1000 );
				batchStartTime = ( new Date() ).getTime();
			}

			doNextRequest();
		}
	}

	function doNextRequest(){

		var servicePath = servicePathKeys[ currentIndex++ ];

		//console.log( servicePath, servicePaths[ servicePath ] );
		var json = servicePaths[ servicePath ];
		var headers = {};

		if( servicePath && json ){

			addServicePathHeader( servicePath, headers );

			requestsSent++;

			sendRequest( handleResponse, {
				method: 'POST',
				path: path,
				data: json,
				headers: headers
			} );
		}
	}

	console.log( 'Sending %s requests, %s at a time', totalRequests, concurrentRequests );

	for( ; concurrentRequests > 0; concurrentRequests-- ){

		doNextRequest();
	}
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