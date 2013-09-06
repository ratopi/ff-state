
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

	directory = {
                	"augsburg": "http://www.wgaugsburg.de/ffapi/ffapi.json",
                	"battlemesh" : "http://feeds.leipzig.freifunk.net/ffapi/battlemesh.json",
                	"berlin" : "http://berlin.freifunk.net/static/berlin.json",
                	"bielefeld" : "http://vpn1.freifunk-bielefeld.de/freifunk/ffapi.json",
                	"brilon" : "http://freifunk-brilon.net/map/generator/ffb_api.json",
                	"chemnitz" : "http://api.routers.chemnitz.freifunk.net/request.php?apikey=f666e95f44c2a54c90f408a2043e30d970fc5f1b&type=com.ffc.info.general",
                	"dresden" : "http://info.ddmesh.de/info/freifunk.json",
                	"franken" : "https://raw.github.com/mojoaxel/freifunkfranken-community/master/freifunkfranken.json",
                	"frankfurt_am_main" : "http://kdserv.dyndns.org/ff-frankfurt.json",
                	"gadow" : "http://feeds.leipzig.freifunk.net/ffapi/gadow.json",
                	"gronau" : "http://freifunk.liztv.net/ffapi/gronau.json",
                	"grossdraxdorf" : "http://feeds.leipzig.freifunk.net/ffapi/grossdraxdorf.json",
                	"halle" : "http://www.freifunk-halle.net/freifunk-api.json",
                	"hamburg" : "http://meta.hamburg.freifunk.net/ffhh.json",
                	"jena" : "http://freifunk-jena.de/jena.json",
                	"kbu" : "http://map.kbu.freifunk.net/ffapi/ffapi.json",
                	"kiel" : "http://freifunk.in-kiel.de/ffapi.json",
                	"leipzig" : "http://feeds.leipzig.freifunk.net/ffapi/leipzig.json",
                	"leisnig" : "http://feeds.leipzig.freifunk.net/ffapi/leisnig.json",
                	"luebeck" : "https://luebeck.freifunk.net/ffapi.json",
                	"lueneburg" : "http://freifunk-lueneburg.de/lueneburg.json",
                	"potsdam" : "http://freifunk-potsdam.de/ffapi.json",
                	"rheinland" : "https://freifunk-rheinland.net/ffapi.json",
                	"rostock" : "http://www.opennet-initiative.de/api.freifunk.net-status.json",
                	"wahlsdorf": "http://rensky.net/freifunk/wahlsdorf.json",
                	"weimarnetz" : "http://weimarnetz.de/weimarnetz.json",
                	"wuppertal" : "http://api.freifunk-wuppertal.net/ffnet/ffwtal.json",
                	"zootzen" : "http://feeds.leipzig.freifunk.net/ffapi/zootzen.json",
                	"wiesenburg" : "http://wiki.freifunk.net/images/7/79/Wiesenburg_freifunk_api.json"
                };

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

		$( '#state' )
			.text( level === 'error' ? "!" : "*" )
			.attr( 'title', message )
			.addClass( cssClass )
			.show();
	}

	// ---

	function updateDirectory()
	{
		$.getJSON( directoryURL ).done(
			function( newDirectoryData )
			{
				directory = newDirectoryData;
			}
		)
		.done(
			function()
			{
				setState( "info", "Read directory.json from '" + directoryURL + "'" );
			}
		)
        .fail(
            function( e )
            {
				setState( "error", "Could not get directory.json from '" + directoryURL + "'" );
            }
        );

        updateStates();

		window.setTimeout( updateDirectory, updateInterval );
	}

	// ---

	function getMetaFor( id )
	{
		var m = meta[ id ];
		if ( ! m )
		{
			var rowId = "status_for_" + id;

			$( "#statusTable" ).append( '<tr id="' + rowId + '">' + id + '<td></td><td></td><td></td><td></td><td></td></tr>' );

			m = { "rowId": rowId, "lastUpdate": 0, "row": $( '#' + rowId ) };
			meta[ id ] = m;
		}

		return m;
	}

	function setStateInTable( id, state )
	{
        var row = getMetaFor( id ).row;
        $( "td:nth-child(1)", row ).text( id );
        $( "td:nth-child(2)", row ).text( state.name );
        $( "td:nth-child(3)", row ).text( state.state.nodes );
        $( "td:nth-child(4)", row ).text( state.state.lastchange );
        $( "td:nth-child(5)", row ).text( "" ).attr( 'title' );
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

			$.getJSON( myDirectory[ id ] )
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
