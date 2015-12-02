#!/usr/bin/env node

/*jshint node:true */

var MAX_SUBSCRIPTIONS = process.argv[ 2 ] ? Number( process.argv[ 2 ] ) : 5;

var fs = require( 'fs' );
var http = require( 'http' );
var path = require( 'path' );
var util = require( 'util' );

var data = require( '../output/data' );
var config = require( './config' );
var contextBroker = require( './lib/contextBroker' );
var DataModel = require( './lib/DataModel' );

var dataModel = new DataModel( data );
var subscriptionsFile = path.resolve( __dirname, '../output/subscriptions.json' );
var subscriptions = [];
var servers = [];

function createSubscription( port, cb ){

	console.log( 'About to create a subscription...' );

	var randomLot = dataModel.pickRandomParkingLot();
	var callbackUrl = util.format( 'http://%s:%s/', config.server.orion.host, port );

	createServer( port, handleRequest, function(){

		contextBroker.createSubscription( randomLot.servicePath, callbackUrl, function( err, res ){

			if( err ){

				console.log( 'Failed to create a subscription for port %s', port );

			} else {

				var subscriptionId = res.body.subscribeResponse.subscriptionId;

				console.log( 'Subscription for port %s created with id: %s', port, subscriptionId );

				subscriptions.push( { port: port, subscriptionId: subscriptionId, servicePath: randomLot.servicePath } );
			}
			
			cb( err );
		} );
	} );
}

function createServer( port, requestHandler, cb ){

	var server = http.createServer();

	server.on( 'request', function( req, res ){

		requestHandler( port, req, res );
	} );
	
	server.listen( port, function(){
		console.log( 'Server listening on port %s is online', port );
		cb();
	} );
	servers.push( server );

	console.log( 'Server created on port: %s', port );
}

function handleRequest( port, req, res ){

	console.log( 'Request received on port %s', port );
}

function allSubscriptionsCreated(){

	console.log( 'Made %s subscriptions and servers', subscriptions.length );

	fs.writeFile( subscriptionsFile, JSON.stringify( subscriptions, null, 2 ), function( err ){

		if( err ){

			console.log( 'Unable to write subscriptions to file' );

		} else {

			console.log( 'Subscriptions written to file' );
		}
	} );
}

function makeSubscriptions( i ){

	i = i || 0;

	var port;
	var subscriptionsCreated = i;

	function handleSubscriptionCreation( err ){

		subscriptionsCreated++;

		if( subscriptionsCreated === MAX_SUBSCRIPTIONS ){

			allSubscriptionsCreated();
		}
	}

	if( i === MAX_SUBSCRIPTIONS ){

		allSubscriptionsCreated();

	} else {

		for( ; i < MAX_SUBSCRIPTIONS; i++ ){

			port = 4001 + i;

			createSubscription( port, handleSubscriptionCreation );
		}
	}
}

if( dataModel.hasData() ){

	dataModel.setMaxRegions( 5 );
	dataModel.setMaxOutCodes( 5 );
	dataModel.setMaxParkingLots( 5 );

	fs.stat( subscriptionsFile, function( err, stats ){

		var totalSubscriptions;
		var serversOnline = 0;

		if( err || !stats.isFile() ){

			console.log( 'No file, create new subscriptions...' );
			makeSubscriptions();

		} else {

			subscriptions = require( subscriptionsFile );
			totalSubscriptions = subscriptions.length;

			console.log( 'We have a file with %s subscriptions', totalSubscriptions );

			if( subscriptions.length ){

				subscriptions.forEach( function( subscription ){

					createServer( subscription.port, handleRequest, function serverOnline(){

						serversOnline++;

						if( serversOnline === totalSubscriptions ){

							makeSubscriptions( totalSubscriptions );
						}
					} );
				} );
			
			} else {

				makeSubscriptions();
			}
		}
	} );
	
} else {

	console.log( 'No data' );
}
