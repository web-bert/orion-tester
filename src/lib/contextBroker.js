
var util = require( 'util' );
var config = require( '../config' );
var brokerJson = require( './brokerJson' );
var sendRequest = require( './sendBrokerRequest' );

function addServicePathHeader( servicePath, headers ){

	if( servicePath && servicePath.charAt( 0 ) !== '/' ){

		servicePath = '/' + servicePath;
	}

	headers[ 'Fiware-ServicePath' ] = servicePath;
}

function sendRequests( path, servicePaths, cb, timeRequests ){

	var servicePathKeys = Object.keys( servicePaths );
	//var lastIndex = servicePathKeys.length - 1;
	var totalRequests = servicePathKeys.length;
	var requestsCompleted = 0;
	var errors = [];
	var currentIndex = 0;
	var concurrentRequests = config.batch.concurrentRequests;
	var requestsSent = 0;
	var startTime = ( new Date() ).getTime();
	var batchStartTime = ( new Date() ).getTime();
	var pauseBatchMin = config.batch.size;
	var pauseBatchMax = config.batch.size;
	var longestRequestTime = 0;
	var shortestRequestTime = 0;

	function handleResponse( err, requestStartTime ){

		requestsCompleted++;

		if( err ){

			errors.push( err );
			console.log( errors );
		}

		if( requestStartTime ){

			var requestTime = ( ( new Date() ).getTime() - requestStartTime ) ;

			//console.log( 'Request took: %s miliseconds', requestTime );

			if( Math.floor( requestsCompleted % ( totalRequests / 10 ) ) === 0 ){

				var percentComplete = Math.floor( ( requestsCompleted / totalRequests ) * 100 );

				if( percentComplete < 100 ){

					console.log( '%s% complete...', percentComplete );
				}
			}

			longestRequestTime = ( longestRequestTime === 0 ? requestTime : Math.max( longestRequestTime, requestTime ) );
			shortestRequestTime = ( shortestRequestTime === 0 ? requestTime : Math.min( shortestRequestTime, requestTime ) );
		}

		if( ( errors.length && requestsCompleted === requestsSent ) || requestsCompleted === totalRequests ){

			var totalRequestTime = ( ( new Date() ).getTime() - startTime );

			console.log( '%s requests sent in %s seconds, %s error(s)', totalRequests, totalRequestTime / 1000, errors.length );

			if( timeRequests ){

				console.log( 'Average time per request = %s miliseconds', Math.ceil( totalRequestTime / totalRequests ) );
				console.log( 'Average requests per second = %s', Math.floor( totalRequests / ( totalRequestTime / 1000 ) ) );
				console.log( 'Longest request = %s miliseconds', longestRequestTime );
				console.log( 'Shortest request = %s miliseconds', shortestRequestTime );
			}

			cb( errors );

		} else {

			if( requestsCompleted % config.batch.size === 0 ){

				console.log( 'Requests %s - %s completed in %s seconds', requestsCompleted - config.batch.size, requestsCompleted, ( ( new Date() ).getTime() - batchStartTime ) / 1000 );
				batchStartTime = ( new Date() ).getTime() + config.batch.interval;
				startTime = ( startTime + config.batch.interval );

				pauseBatchMin = requestsCompleted;
				pauseBatchMax = requestsCompleted + config.batch.concurrentRequests;

				console.log( 'Pausing between requests %s and %s for %s seconds', pauseBatchMin, pauseBatchMax, config.batch.interval / 1000  );
			} 

			if( requestsCompleted >= pauseBatchMin && requestsCompleted <= pauseBatchMax ){

				//console.log( 'Pausing request %s', requestsCompleted );
				setTimeout( doNextRequest, config.batch.interval );

			} else {

				doNextRequest();
			}
		}
	}

	function doNextRequest(){

		var servicePath = servicePathKeys[ currentIndex++ ];

		//console.log( servicePath, servicePaths[ servicePath ] );
		var json = servicePaths[ servicePath ];
		var headers = {};
		var responseHandler = handleResponse;
		var requestStartTime;

		if( timeRequests ){

			requestStartTime = ( new Date() ).getTime();

			responseHandler = function( err ){

				handleResponse( err, requestStartTime );
			};
		}

		if( servicePath && json ){

			addServicePathHeader( servicePath, headers );

			requestsSent++;

			sendRequest( responseHandler, {
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
	},

	createContexts: function( dataModel, cb ){

		var path = '/v1/registry/registerContext';
		var servicePaths = brokerJson.createContexts( dataModel );
		
		sendRequests( path, servicePaths, cb );
	},

	initialiseContexts: function( dataModel, cb ){

		var path = 'v1/updateContext';
		var servicePaths = brokerJson.updateContexts( dataModel );
		
		sendRequests( path, servicePaths, cb );
	},

	queryContexts: function( dataModel, cb ){

		var path = '/v1/registry/discoverContextAvailability';
		var servicePaths = brokerJson.getContexts( dataModel );

		sendRequests( path, servicePaths, cb, true );
	},

	createSubscription: function( servicePath, referenceUrl, cb ){

		var json = {
				entities: [
					{
						type: 'parking_space',
						isPattern: 'true',
						id: 'parking_space_.*'
					}
				],
				attributes: [
					'availability'
				],
				reference: referenceUrl,
				duration: 'P1M',
				notifyConditions: [
					{
						type: 'ONCHANGE',
						condValues: [
							'availability'
						]
					}
				]
			};

		console.log( 'Creating subscription to: %s', referenceUrl );

		sendRequest( cb, {

			method: 'POST',
			path: '/v1/subscribeContext',
			data: json

		} );
	},

	removeSubscription: function( subscriptionId, cb ){

		sendRequest( cb, {

			method: 'DELETE',
			path: ( '/v1/contextSubscriptions/' + subscriptionId )
			
		});
	}
};