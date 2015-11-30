#!/usr/bin/env node

/*jshint node:true */

var randomString = require( 'random-string' );
var util = require( 'util' );

var config = require( './config' );
var data = require( '../output/data' );
var contextBroker = require( './lib/contextBroker' );
var DataModel = require( './lib/DataModel' );
var dataModel = new DataModel( data );

var updatesToMake = Number( process.argv[ 2 ] ) || 50;
var concurrentRequests = config.batch.concurrentRequests;
var requestsComplete = 0;
var requestsSent = 0;
var i = 0;
var startTime = Date.now();
var errors = [];
var longestRequestTime = 0;
var shortestRequestTime = 0;
var logPercentage = ( updatesToMake > 50 );

function handleResponse( err, res, requestStartTime ){

	var now = Date.now();
	var requestTime = ( now - requestStartTime );
	var totalRequestTime;

	requestsComplete++;
	//console.log( err, res );
	//console.log( 'Sent: %s, complete: %s', requestsSent, requestsComplete );
	longestRequestTime = ( longestRequestTime === 0 ? requestTime : Math.max( longestRequestTime, requestTime ) );
	shortestRequestTime = ( shortestRequestTime === 0 ? requestTime : Math.min( shortestRequestTime, requestTime ) );

	if( !err && res.body.code !== "200" ){

		errors.push( res );
	}

	if( logPercentage && Math.floor( requestsComplete % ( updatesToMake / 10 ) ) === 0 ){

		var percentComplete = Math.floor( ( requestsComplete / updatesToMake ) * 100 );

		if( percentComplete < 100 ){

			console.log( '%s% complete, elapsed time: %s seconds', percentComplete, ( now - startTime ) / 1000 );
		}
	}

	if( requestsSent === updatesToMake ){

		if( requestsSent === requestsComplete ){

			totalRequestTime = ( now - startTime );

			console.log( 'Done making updates. Total time taken: %s seconds', totalRequestTime / 1000 );
			console.log( 'Average time per request = %s miliseconds', Math.ceil( totalRequestTime / requestsSent ) );
			console.log( 'Average requests per second = %s', Math.floor( requestsSent / ( totalRequestTime / 1000 ) ) );
			console.log( 'Longest request = %s miliseconds', longestRequestTime );
			console.log( 'Shortest request = %s miliseconds', shortestRequestTime );

			if( errors.length ){

				console.log( '%s error%s received', errors.length, errors.length === 1 ? '' : 's' );
				console.log( util.inspect( errors, { depth: 6 } ) );
			}
		}

	} else {

		doNextRequest();
	}
}

function doNextRequest(){

	var state = randomString( { length: 16 } );
	var spaceInfo = dataModel.pickRandomSpace();
	var requestStartTime = Date.now();

	if( spaceInfo ){

		//console.log( requestsSent, spaceInfo.servicePath, state );

		requestsSent++;
		//contextBroker.updateState( '/scotland/aberdeen_city/AB10/lot_0', 0, state, handleResponse );
		contextBroker.updateState( spaceInfo.servicePath, spaceInfo.data.space.id, state, function( err, res ){

			handleResponse( err, res, requestStartTime );
		} );

	} else {

		console.log( 'Space not found trying another...', spaceInfo );
		doNextRequest();
	}
}

if( dataModel.hasData() ){

	console.log( 'Making %s update requests, %s at a time', updatesToMake, concurrentRequests );

	for( ; i < concurrentRequests; i++ ){

		doNextRequest();
	}

} else {

	console.log( 'No data' );
}

