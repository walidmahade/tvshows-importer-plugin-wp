<?php
require_once ( plugin_dir_path( __FILE__ ) . "./videos.php" );
require_once ( plugin_dir_path( __FILE__ ) . "./cast-names.php");
require_once ( plugin_dir_path( __FILE__ ) . "./cast-details.php");
require_once ( plugin_dir_path( __FILE__ ) . "./image-gallery.php");
require_once ( plugin_dir_path( __FILE__ ) . "./seasons-list.php");
require_once ( plugin_dir_path( __FILE__ ) . "./related-tvshows.php");

// Register the widget
function my_register_custom_widget() {
	register_widget( 'Mw_TV_show_videos' );
	register_widget( 'Mw_TV_show_cast' );
	register_widget( 'Mw_TV_show_cast_details' );
	register_widget( 'Mw_TV_show_images_gallery' );
	register_widget( 'Mw_TV_show_seasons' );
	register_widget( 'Mw_TV_show_related' );
}
add_action( 'widgets_init', 'my_register_custom_widget' );