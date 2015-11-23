#!/usr/bin/env node

/*jshint node:true */

var INPUT = '../data/postcodes.csv';
var OUTPUT = '../output/data.json';
var fs = require( 'fs' );
var data = {};
var json = [];

fs.readFile( INPUT, { encoding: 'utf-8' }, function( err, file ){

	var rows = file.split( '\n' );

	rows.splice( 0, 1 );//remove the headers

	rows.forEach( function( row ){

		if( !row.length ){ return; }

		//console.log( row );
		var items = row.replace( /("|')/g, '' ).split( ',' );

		var postcode = items[ 0 ];
		var eastings = items[ 1 ];
		var northings = items[ 2 ];
		var latitude = items[ 3 ];
		var longitude = items[ 4 ];
		var town = items[ 5 ];
		var region = items[ 6 ];
		var country = items[ 7 ];
		var countryString = items[ 8 ];

		if( !data[ country ] ){

			data[ country ] = {};
		}

		if( !data[ country ][ region ] ){

			data[ country ][ region ] = [];
		}

		data[ country ][ region ].push( postcode );

/*		{
			eng: {
				kent: [ 'me15', 'me14' ]
			}
		}
*/

	} );

	//console.log( data );

	Object.keys( data ).forEach( function( country ){

		var countryData = data[ country ];
		var countryJson = {
			name: country,
			regions: []
		};

		Object.keys( countryData ).forEach( function( region ){

			countryJson.regions.push({

				name: region,
				postcodes: countryData[ region ]
			});
		} );

		json.push( countryJson );
	} );

/*

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

		if( !err ){
			console.log( 'File written' );
		}
	} );
} );

