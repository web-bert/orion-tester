var sendRequest = require( './sendBrokerRequest' );

process.on( 'message', function( msg ){

	var id = msg.id;
	var opts = msg.opts;

	//console.log( 'Child received message for id: %s', id );

	sendRequest( function( err, data ){

		//console.log( 'Response received', err, data );
		process.send( { id: id, err: err, data: data } );
		
	}, opts );

} );