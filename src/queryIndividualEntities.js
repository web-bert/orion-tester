#!/usr/bin/env node

/*jshint node:true */

var data = require( '../output/data' );
var contextBroker = require( './lib/contextBroker' );
var DataModel = require( './lib/DataModel' );
var dataModel = new DataModel( data );

if( dataModel.hasData() ){

	dataModel.setMaxRegions( 1 );
	dataModel.setMaxOutCodes( 5 );
	dataModel.setMaxParkingLots( 5 );

	console.log( 'About to query contexts...' );

	contextBroker.queryContext( dataModel, function( errors ){

		console.log( 'Queries complete' );

		if( errors.length ){

			//console.log(  errors );
		}
	} );

} else {

	console.log( 'No data' );
}
