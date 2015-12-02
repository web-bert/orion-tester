#!/usr/bin/env node

/*jshint node:true */

var data = require( '../output/data' );
var DataModel = require( './lib/DataModel' );
var contextBroker = require( './lib/contextBroker' );
var dataModel = new DataModel( data );
// For testing cut the dataset down to one space per country
//dataModel.oneSpaceEach();

//dataModel.setMaxRegions( 1 );
//dataModel.setMaxOutCodes( 2 );
//dataModel.setMaxParkingLots( 2 );

if( dataModel.hasData() ){
	
	console.log( 'About to create contexts...' );

	contextBroker.createContexts( dataModel, function( errors ){

		if( errors.length ){

			console.log( 'Unable to create entities', errors );

		} else {

			console.log( '\nEntities created, now updating entities...' );

			contextBroker.initialiseContexts( dataModel, function( errors ){

				if( errors.length ){

					console.log( 'Unable to update entities', errors );

				} else {

					console.log( 'Setup complete' );
				}
			} );
		}
		
	} );

} else {

	console.log( 'No data' );
}
