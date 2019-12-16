<?php
// The widget class
class Mw_TV_show_videos extends WP_Widget {
	// Main constructor
	public function __construct() {
		parent::__construct(
			'mw_tv_show_videos',
			__( 'Mw TV show videos', 'text_domain' ),
			array(
				'customize_selective_refresh' => true,
			)
		);
	}

	// The widget form (for the backend )
	public function form( $instance ) {
		/* ... */
	}

	// Update widget settings
	public function update( $new_instance, $old_instance ) {
		/* ... */
	}

	// Display the widget
	public function widget( $args, $instance ) {
		// check if the repeater field has rows of data
		if( have_rows('videos') ):
			// loop through the rows of data
			while ( have_rows('videos') ) : the_row();
				// display a sub field value
				echo "<p>" . the_sub_field('url') . "</p>";
			endwhile;
		else :
			echo "<p class='not-found'>No Videos found.</p>";
		endif;
	}

}

// Register the widget
function my_register_custom_widget() {
	register_widget( 'Mw_tv_show_videos' );
}
add_action( 'widgets_init', 'my_register_custom_widget' );