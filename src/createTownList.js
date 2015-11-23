#!/usr/bin/env node

/*jshint node:true */

var INPUT = '../data/postcodes.csv';
var OUTPUT = '../output/data.json';
var fs = require( 'fs' );
var data = {};
var json = [];
var notAllowedChars = /([^-_a-z0-9]|\s)+/g;

function makeServiceName( input ){

	var lower = input.toLowerCase();

	return lower.replace( notAllowedChars, '-' );
}

fs.readFile( INPUT, { encoding: 'utf-8' }, function( err, file ){

	if( err ){
		console.log( err );
		return;
	}

	var rows = file.split( '\n' );

	rows.splice( 0, 1 );//remove the headers

	rows.forEach( function( row ){

		if( !row.length ){ return; }

		//console.log( row );
		var items = row.replace( /"/g, '' ).split( ',' );

		var outcode = items[ 0 ].trim().toUpperCase();
		var eastings = items[ 1 ].trim();
		var northings = items[ 2 ].trim();
		var latitude = items[ 3 ].trim();
		var longitude = items[ 4 ].trim();
		var town = items[ 5 ].trim();
		var region = items[ 6 ].trim();
		var country = items[ 7 ].trim();
		var countryString = items[ 8 ].trim();

		if( !data[ country ] ){

			data[ country ] = {};
		}

		if( !data[ country ][ region ] ){

			data[ country ][ region ] = [];
		}

		data[ country ][ region ].push( outcode );

	} );

/*
	Now organised by country/region/outcodes
		{
			eng: {
				city: [ 'me15', 'me14' ]
			}
		}
*/
	//console.log( data );

	Object.keys( data ).forEach( function( country ){

		var countryData = data[ country ];
		var countryJson = {
			name: country,
			serviceName: makeServiceName( country ),
			regions: []
		};

		Object.keys( countryData ).forEach( function( region ){

			countryJson.regions.push({

				name: region,
				serviceName: makeServiceName( region ),
				outcodes: countryData[ region ]
			});
		} );

		json.push( countryJson );
	} );

/*
	Now organised as array of countries with regions with outcodes. This will enable us to randomly pick a country/region/outcode

	[
		{
			name: "ENG",
			regions: [
				{
					name: "city name 1",
					outcodes: [ 'CN1', 'CN2' ]//etc
				},{
					name: "city name 2",
					outcodes: [ 'CM1', 'CM2' ]//etc
				}
			]
		}
	]

*/

	fs.writeFile( OUTPUT, JSON.stringify( json, null, 2 ), function( err ){

		if( err ){

			console.log( 'Unable to write file: ', err );

		} else {

			console.log( 'File written' );
		}
	} );
} );

