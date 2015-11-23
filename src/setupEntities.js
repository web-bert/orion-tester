#!/usr/bin/env node

/*jshint node:true */

var data = require( '../output/data' );
var http = require( 'http' );
var util = require( 'util' );
var getRandomOutcode = require( './lib/getRandomOutcode' );

var requiredEntities = 5;
var i = 0;

function getRandomServicePath(){

	var json = getRandomOutcode( data );

	return util.format( '/%s/%s/%s', json.townData.serviceName, json.regionData.serviceName, json.outcode );
}

if( data && data.length ){

	for( ; i < requiredEntities; i++ ){

		var path = getRandomServicePath();

		console.log( path );
	}

} else {

	console.log( 'No data' );
}
