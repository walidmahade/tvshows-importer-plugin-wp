<?php
/*
	Plugin Name: Tvshows Importer
	Author URI: https://mahade.dev
*/

// setup admin pages
add_action( 'admin_menu', 'my_admin_menu' );

function my_admin_menu() {
	add_menu_page( 'TV Show Import', 'TV Show Import', 'manage_options', 'tv-shows-import.php', 'mw_tv_show_import_page', 'dashicons-tickets', 200  );
}

function mw_tv_show_import_page(){
	?>
    <div class="mw-tv-shows">
		
		<button id="select-all-btn" class="button">Select All</button>

        <div id="ui-update">
            Use search to get started.
        </div>

		<h2 class="page-title">Import TV Shows</h2>

        <div class="header-under">
			<div class="search-wrap">
				<input type="search" placeholder="Search TV Shows"
					id="search-field">
			</div>

			<!-- START filters -->
			<div id="filters">
				<select id="sort-tvshows">
					<option value="default" selected>Default.</option>
					<option value="first_air_date">By Release Date.</option>
					<option value="vote_average">By Rating.</option>
					<option value="popularity">By Popularity.</option>
				</select>
			</div>
			<!-- END filters -->
		</div>

		<div class="suggest-btns">
			<span class="span text-btn">Suggested TVshows: </span>
			<button id="recent-btn" class="button">Most Recent</button>
			<button id="top-rated-btn" class="button">Top Rated</button>
			<button id="most-popular-btn" class="button">Pupular</button>
		</div>
        
        <div id="tv-shows-result">

        </div>
        <!-- END search results -->

		<!-- START pagination -->
		<div id="pagination">
			<span>Show page</span>
			<input type="number" name="result-page-no" id="result-page-no" value="0">
			<span>of </span>
			<span id="total-pages"></span>
			<span> Pages</span>
		</div>
		<!-- END pagination -->
        
		<!-- save multimple shows -->
		<div class="cta-2" style="text-align: center">
            <button class="button" disabled>Import Selected</button>
        </div>
	</div>
	<?php
}

// add page scripts and styles
add_action( 'admin_enqueue_scripts', 'mw_tv_shows_scripts_styles' );

function mw_tv_shows_scripts_styles( $hook ) {
	if( 'toplevel_page_tv-shows-import' != $hook ) return;
	wp_enqueue_style( 'mw-tv-shows-js',
		plugins_url( '/assets/main.css', __FILE__ ),''
	);

	wp_enqueue_script( 'mw-tv-shows-js',
		plugins_url( '/assets/main.js', __FILE__ ),
		array( 'jquery' ), '1.0', true
	);
	
	wp_localize_script('mw-tv-shows-js', 'magicalData', array(
		'nonce' => wp_create_nonce('wp_rest'),
		'siteURL' => get_site_url()
	));
}

//require (
//        plugins_url('/add-rest-endpoints.php', __FILE__)
//);

require_once ( plugin_dir_path( __FILE__ ) . '/add-rest-endpoints.php');
require_once ( plugin_dir_path( __FILE__ ) . '/widgets/videos.php');