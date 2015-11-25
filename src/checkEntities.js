#!/usr/bin/env node

/*jshint node:true */

var util = require( 'util' );

var data = require( '../output/data' );
var config = require( './config' );
var getRandomItem = require( './lib/getRandomItem' );
var getRandomOutcode = require( './lib/getRandomOutcode' );
var contextBroker = require( './lib/contextBroker' );

//var requiredEntities = config.entities;
var requiredEntities = 10;
var i = 0;

function getRandomServicePath(){

	var json = getRandomOutcode( data );
	var lot = getRandomItem( json.outcode.parkingLots );

	return util.format( '/%s/%s/%s/%s', json.townData.serviceName, json.regionData.serviceName, json.outcode.serviceName, lot.serviceName );
}

function handleResponse( err, res ){

	console.log( err, res );
}




if( data && data.length ){

	//contextBroker.getContexts( handleResponse );
	//contextBroker.getContexts( handleResponse, '/scotland/aberdeen_city/AB10/lot_0' );
	
	for( ; i < requiredEntities; i++ ){

		var servicePath = getRandomServicePath();

		console.log( servicePath );
		contextBroker.getContexts( handleResponse, servicePath );
	}

} else {

	console.log( 'No data' );
}

