#!/usr/bin/env node

/*jshint node:true */

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( 'util' );

var config = require( './config' );
var contextBroker = require( './lib/contextBroker' );

var subscriptionsFile = path.resolve( __dirname, '../output/subscriptions.json' );
var subscriptions = [];

function allSubscriptionsRemoved( total ){

	console.log( 'Attempted to remove all subscriptions' );

	fs.writeFile( subscriptionsFile, JSON.stringify( subscriptions, null, 2 ), function( err ){

		if( err ){

			console.log( 'Unable to write subscriptions to file', err );

		} else {

			console.log( 'Subscriptions written back to file' );
		}
	} );
}

function removeSubscription( subscriptionToRemove ){

	var i = 0;
	var subscription;

	while( ( subscription = subscriptions[ i++ ] ) ){

		if( subscription.subscriptionId === subscriptionToRemove.subscriptionId ){

			subscriptions.splice( i - 1, 1 );
			console.log( 'Removed subscription with id: %s', subscription.subscriptionId );
			break;
		}
	}
}

fs.stat( subscriptionsFile, function( err, stats ){

	var totalSubscriptions;
	var subscriptionsRemoved = 0;

	if( err || !stats.isFile() ){

		console.log( 'No file, nothing to do' );

	} else {

		subscriptions = require( subscriptionsFile );
		totalSubscriptions = subscriptions.length;

		console.log( 'We have a file with %s subscriptions', totalSubscriptions );

		if( subscriptions.length ){

			subscriptions.forEach( function( subscription, index ){

				contextBroker.removeSubscription( subscription.subscriptionId, function( err, res ){

					subscriptionsRemoved++;

					if( err || res.body.statusCode.code !== '200' ){

						console.log( 'Unable to remove subscription' );
						console.log( res );

					} else {

						removeSubscription( subscription );
					}

					if( subscriptionsRemoved === totalSubscriptions ){

						allSubscriptionsRemoved( totalSubscriptions );
					}
				} );
			} );
		
		} else {

			console.log( 'No data in file, nothing to do.' );
		}
	}
} );
