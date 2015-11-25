#!/usr/bin/env node

/*jshint node:true */

var util = require( 'util' );
var randomString = require( 'random-string' );

var data = require( '../output/data' );
var config = require( './config' );
var getRandomItem = require( './lib/getRandomItem' );
var getRandomOutcode = require( './lib/getRandomOutcode' );
var contextBroker = require( './lib/contextBroker' );

//var requiredEntities = config.entities;
var requiredEntities = 1;
var i = 0;

function getRandomSpace(){

	var json = getRandomOutcode( data );
	var lot = getRandomItem( json.outcode.parkingLots );
	var space = getRandomItem( lot.spaces );

	return {
		servicePath: util.format( '/%s/%s/%s/%s', json.townData.serviceName, json.regionData.serviceName, json.outcode.serviceName, lot.serviceName ),
		space: space
	};
}

function handleResponse( err, res ){

	console.log( err, res );
}

if( data && data.length ){

	for( ; i < requiredEntities; i++ ){

		var spaceData = getRandomSpace();
		var state = randomString( { length: 16 } );

		//console.log( spaceData, state );

		contextBroker.updateState( '/scotland/aberdeen_city/AB10/lot_0', 0, state, handleResponse );
		//contextBroker.updateState( spaceData.servicePath, spaceData.space.id, state, handleResponse );
	}

} else {

	console.log( 'No data' );
}

