
// --- package creation ...

var de = de = de || {};
de.ratopi = de.ratopi || {};
de.ratopi.f4m2 = de.ratopi.f4m2 || {};

// --- package interface definition

de.ratopi.f4m2.state = function( directoryURL )
{
	// ==== private members ====

	var updateInterval = 5 * 60 * 1000; // 5 minutes

	var directory = {}; // holds the urls of the Freifunk network state objects ...

	var states = {}; // holds the states objects of all freifunk networks.  Keys are the ones used in the directory.

	var meta = {}; // holds the row IDs for each Freifunk network in the state table

	// ==== initial setup ====

	updateDirectory();

	// ==== interface ====

	return {
	};

	// ==== interface functions ====

	// ==== private functions ====

	function setState( level, message )
	{
		$( '#state' )
			.text( '' )
			.attr( 'title', null )
			.removeClass( 'error' )
			.removeClass( 'info' )
			.removeClass( 'success' )
			.hide();

		var cssClass = null;
		if ( level === 'error' )
		{
			cssClass = 'error';
		}
		else if ( level === 'info' )
		{
			cssClass = 'info';
		}
		else if ( level === 'success' )
		{
			cssClass = 'success';
		}

		$( '#state' )
			.text( level === 'error' ? "!" : "*" + ( new Date() ))
			.attr( 'title', message )
			.addClass( cssClass )
			.show();
	}

	// ---

	function updateDirectory()
	{
		$.ajax( {
			url: directoryURL,
			type: 'GET',
			dataType: 'json',

			beforeSend:
				function()
                {
                    setState( "info", "Trying to reach '" + directoryURL + "'" );
                },

			error:
				function( e )
				{
					setState( "error", "Could not get directory.json from '" + directoryURL + "'" );
				},

			success:
				function( newDirectoryData )
				{
					setState( "success", "Read directory.json from '" + directoryURL + "'" );
					directory = newDirectoryData;
					updateStates();
				},
			complete:
				function()
				{
					window.setTimeout( updateDirectory, updateInterval );
				}
		} );
	}

	// ---

	function getMetaFor( id )
	{
		var m = meta[ id ];
		if ( ! m )
		{
			var rowId = "status_for_" + id;

			$( "#statusTable" ).append( '<tr id="' + rowId + '"><td>' + id + '</td><td></td><td></td><td></td><td>?</td></tr>' );

			m = { "rowId": rowId, "lastUpdate": 0, "row": $( '#' + rowId ) };
			meta[ id ] = m;
		}

		return m;
	}

	function setStateInTable( id, state )
	{
		var meta = getMetaFor( id );

		meta.lastUpdate = state.state.lastchange;

        var row = meta.row;
        $( "td:nth-child(1)", row ).text( id );
        $( "td:nth-child(2)", row ).text( state.name );
        $( "td:nth-child(3)", row ).text( state.state.nodes );
        $( "td:nth-child(4)", row ).text( state.state.lastchange );
        $( "td:nth-child(5)", row ).text( "" ).attr( 'title', null );
        row.removeClass( 'failed' );
	}

	function setStateInTableFailed( id )
	{
        var row = getMetaFor( id ).row;
        $( "td:nth-child(1)", row ).text( id );
        $( "td:nth-child(5)", row ).text( "!" ).attr( 'title', 'Could not reach.');
        row.addClass( 'failed' );
	}

	// ---

	function updateStates()
	{
		var myDirectory = directory; // ensure no modifications ;-)
		for ( var id in myDirectory )
		{
			// getMetaFor( id ); // prepare table rows

			getMetaFor( id ).row.addClass( 'loading' );

			$.getJSON( 'data/' + id + '.json' ) // myDirectory[ id ] )
				.success(
					function ( id )
					{
						return function( state )
						{
							setStateInTable( id, state );
						}
					}( id )
				)
				.fail(
					function( id )
					{
						return function()
						{
							setStateInTableFailed( id );
						}
					}( id )
				)
				.complete(
					function( id )
					{
						return function()
						{
							getMetaFor( id ).row.removeClass( 'loading' );
						}
					}( id )
				);
		}
	}

};
