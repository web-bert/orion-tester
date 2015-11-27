
var config = require( '../config' );
var http = require( 'http' );
var util = require( 'util' );

var HOST = config.orion.host;
var PORT = config.orion.port;

module.exports = function sendRequest( cb, options ){

	var postData;
	var headers = options.headers || {};

	headers[ 'Accept' ] = 'application/json';

	if( options.data ){

		postData = JSON.stringify( options.data );
		headers[ 'Content-Type' ] = 'application/json';
		headers[ 'Content-Length' ] = postData.length;
	}

	//console.log( 'Send request to: %s:%s/%s with headers %s and data %s', HOST, PORT, options.path, util.inspect( headers ), util.inspect( options.data ) );
	//setTimeout( cb, 800 + Math.floor( Math.random() * 1000 ) );
	//return;

	var req = http.request( {

		hostname: HOST,
		port: PORT,
		path: options.path,
		method: options.method,
		headers: headers

	}, function( res ){

		var data = '';

		res.setEncoding( 'utf8' );

		res.on( 'data', function( chunk ){
			data += chunk;
		} );

		res.on( 'end', function(){
			//console.log( 'Response received. Status: %s, body: %s', res.statusCode, data );
			try {

				data = JSON.parse( data );

			} catch( e ){}

			cb( null, { status: res.statusCode, body: data } );
		} );
	} );

	req.on( 'error', function( e ){
		//console.log( 'Error with request: %s', e.message );
		cb( e );
	} );

	if( postData ){

		req.write( postData );
	}

	req.end();
};