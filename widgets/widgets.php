<?php
require_once ( plugin_dir_path( __FILE__ ) . "./videos.php" );
require_once ( plugin_dir_path( __FILE__ ) . "./cast.php");

// Register the widget
function my_register_custom_widget() {
	register_widget( 'Mw_TV_show_videos' );
	register_widget( 'Mw_TV_show_cast' );
}
add_action( 'widgets_init', 'my_register_custom_widget' );