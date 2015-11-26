#!/usr/bin/env node

/*jshint node:true */

var data = require( '../output/data' );
var contextBroker = require( './lib/contextBroker' );

function minimiseData(){

	data.forEach( function( country ){

		country.regions.splice( 1, country.regions.length );
		country.regions[ 0 ].outcodes.splice( 1, country.regions[ 0 ].outcodes.length );
		country.regions[ 0 ].outcodes[ 0 ].parkingLots.splice( 1, country.regions[ 0 ].outcodes[ 0 ].parkingLots.length );
		country.regions[ 0 ].outcodes[ 0 ].parkingLots[ 0 ].spaces.splice( 1, country.regions[ 0 ].outcodes[ 0 ].parkingLots[ 0 ].spaces.length );
	} );

	//console.log( require( 'util' ).inspect( data, { depth: 10 } ) );
}

// Use minimiseData for testing to cut the dataset down to one space per country
//minimiseData();

if( data && data.length ){

	console.log( 'About to create contexts...' );

	contextBroker.createContexts( data, function( errors ){

		if( errors.length ){

			console.log( 'Unable to create entities', errors );

		} else {

			console.log( '\nEntities created, now updating entities...' );

			contextBroker.initialiseContexts( data, function( errors ){

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
