#!/usr/bin/env node

/*jshint node:true */

var INPUT = './postcodes.csv';
var OUTPUT = '../output/data.json';

var fs = require( 'fs' );
var config = require( '../src/config' );
var getRandomItem = require( '../src/lib/getRandomItem' );
var getRandomOutcode = require( '../src/lib/getRandomOutcode' );

var json = [];
var notAllowedChars = /([^_a-z0-9]|\s)+/g;
var primes = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97 ];
var maxRandomNumber = 100;

function makeServiceName( input ){

	var lower = input.toLowerCase();

	return lower.replace( notAllowedChars, '_' );
}

function createData( file ){

	var data = {};
	var rows = file.split( '\n' );

	rows.splice( 0, 1 );//remove the headers

	rows.forEach( function( row ){

		if( !row.length ){ return; }

		//console.log( row );
		var items = row.split( '","' ).map( function( item ){

			return item.replace( /"/g, '' ).trim();

		} );

		var outcode = items[ 0 ].toUpperCase();
		//var eastings = items[ 1 ];
		//var northings = items[ 2 ];
		//var latitude = items[ 3 ];
		//var longitude = items[ 4 ];
		//var town = items[ 5 ];
		var region = items[ 6 ];
		//var country = items[ 7 ];
		var countryString = items[ 8 ];

		if( outcode && region && countryString ){

			if( !data[ countryString ] ){

				data[ countryString ] = {};
			}

			if( !data[ countryString ][ region ] ){

				data[ countryString ][ region ] = [];
			}

			data[ countryString ][ region ].push( outcode );	
		}
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
	return data;
}

function createJson( data ){

	var json = [];

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
				outcodes: countryData[ region ].map( function( code ){

					return {
						serviceName: code,
						parkingLots: []
					};

				} )
			});
		} );

		json.push( countryJson );
	} );

	/*
		Now organised as array of countries with regions with outcodes. This will enable us to randomly pick a country/region/outcode

		[
			{
				name: "ENG",
				serviceName: "eng",
				regions: [
					{
						name: "city name 1",
						serviceName: "city_name_1",
						outcodes: [ {
							code: "CN1",
							parkingLots: []
						},{
							code: "CN2",
							parkgingLots: []
						}//etc
					},{
						name: "city name 2",
						serviceName: "city_name_2",
						outcodes: [ {
							code: "CM1",
							parkingLots: []
						},{
							code: "CM2",
							parkgingLots: []
						}//etc
					}
				]
			}
		]

	*/

	return json;
}

function hasEnoughSpaces( prevHasEnough, current, currentIndex ){

	if( currentIndex === 0 ){

		return current.spaces.length > 3;

	} else {

		return prevHasEnough ? current.spaces.length > 3 : false;
	}
}

function shouldAddParkingLot( parkingLots ){

	var random;
	var allLotsHaveSpaces;

	if( parkingLots.length ){

		allLotsHaveSpaces = parkingLots.reduce( hasEnoughSpaces, false );

		if( allLotsHaveSpaces ){

			random = Math.floor( Math.random() * maxRandomNumber );

			return primes.indexOf( random ) >= 0;

		} else {

			return false;
		}
	}

	return true;
}

function addParkingLot( parkingLots ){

	//console.log( 'add lot' );

	var index = parkingLots.length;

	parkingLots[ index ] = {
		serviceName: ( 'lot_' + index ),
		spaces: [
			{
				id: 0
			}
		]
	};
}

function addSpace( lot ){

	//console.log( 'add space' );

	var index = lot.spaces.length;

	lot.spaces[ index ] = {
		id: index
	};
}

function createEntities( json, entities ){

	var i = 0;
	var data;
	var parkingLots;
	var addLot;

	for( ; i < entities; i++ ){

		data = getRandomOutcode( json );
		parkingLots = data.outcode.parkingLots;
		addLot = shouldAddParkingLot( parkingLots );

		if( addLot ){

			addParkingLot( parkingLots );

		} else {

			addSpace( getRandomItem( parkingLots ) );
		}
	}
}

fs.readFile( INPUT, { encoding: 'utf-8' }, function( err, file ){

	if( err ){
		console.log( err );
		return;
	}

	console.log( 'Creating data for %s entities', config.entities );

	var data = createData( file );
	var json = createJson( data );
	
	createEntities( json, config.entities );

	fs.writeFile( OUTPUT, JSON.stringify( json, null, 2 ), function( err ){

		if( err ){

			console.log( 'Unable to write file: ', err );

		} else {

			console.log( 'File written' );
		}
	} );
} );

