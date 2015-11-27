#!/usr/bin/env node

/*jshint node:true */

var data = require( '../output/data' );
var contextBroker = require( './lib/contextBroker' );
var DataModel = require( './lib/DataModel' );
var dataModel = new DataModel( data );

if( dataModel.hasData() ){

	dataModel.setMaxParkingLots( 5 );
	dataModel.setMaxOutCodes( 5 );
	dataModel.setMaxRegions( 5 );

	console.log( 'About to query contexts...' );

	contextBroker.queryContexts( dataModel, function( errors ){

		if( errors.length ){

			console.log( 'Unable to query entities', errors );

		} else {

			console.log( 'Queries complete' );			
		}
		
	} );

} else {

	console.log( 'No data' );
}
