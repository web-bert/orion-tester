#!/usr/bin/env node

/*jshint node:true */

var http = require( 'http' );
var util = require( 'util' );

var data = require( '../output/data' );
var config = require( './config' );
var getRandomItem = require( './lib/getRandomItem' );
var getRandomOutcode = require( './lib/getRandomOutcode' );

//var requiredEntities = config.entities;
var requiredEntities = 100;
var i = 0;

function getRandomServicePath(){

	var json = getRandomOutcode( data );
	var lot = getRandomItem( json.outcode.parkingLots );
	var space = getRandomItem( lot.spaces );

	return util.format( '/%s/%s/%s/%s/%s', json.townData.serviceName, json.regionData.serviceName, json.outcode.code, lot.serviceName, space.serviceName );
}

if( data && data.length ){

	for( ; i < requiredEntities; i++ ){

		var path = getRandomServicePath();

		console.log( path );
	}

} else {

	console.log( 'No data' );
}
