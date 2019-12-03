<?php
/*
	Plugin Name: Tvshows Importer
	Author URI: https://mahade.dev
*/

/**
 * psudo code
    * Add Custom Post type
    * Add Admin Pages
    * Setup other Functionality
 */

// setup admin pages
add_action( 'admin_menu', 'my_admin_menu' );

function my_admin_menu() {
	add_menu_page( 'TV Show Import', 'TV Show Import', 'manage_options', 'tv-shows-import.php', 'mw_tv_show_import_page', 'dashicons-tickets', 200  );
}

function mw_tv_show_import_page(){
	?>
	<div class="mw-tv-shows">
		<h2 class="page-title">Import TV Shows</h2>

        <div class="search-wrap">
            <input type="search" placeholder="Search TV Shows"
                id="search-field">
        </div>
        
        <div id="tv-shows-result">
<!--            <div class="tv-show-item is-duplicate">-->
<!--                <img src="http://placekitten.com/200/200" alt="" class="poster">-->
<!--                <div class="duplicate-badge show">-->
<!--                    Already Imported!!-->
<!--                </div>-->
<!--                <div class="content">-->
<!--                    <h3 class="title">Movie Title</h3>-->
<!--                    <p class="para">Other Info Other Info Other Info Other Info Other Info Other Info Other Info Other Info Other Info Other Info Other Info Other Info Other Info Other Info </p>-->
<!--                    <div class="cta">-->
<!--                        <button class="button button--import">Import</button>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
        </div>
        <!-- END search results -->
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